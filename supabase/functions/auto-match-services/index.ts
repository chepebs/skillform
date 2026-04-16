import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/cors';

interface ServiceSkill {
  skill_name: string;
  importance_level: string;
  min_proficiency: number;
}

interface EmployeeSkill {
  skill_name: string;
  proficiency_level: number;
  years_experience: number | null;
}

interface MatchBreakdown {
  proficiency: number;
  years_experience: number | null;
  score: number;
  importance: string;
}

function calculateMatch(
  employeeSkills: EmployeeSkill[],
  serviceSkills: ServiceSkill[],
  catalogSkills: string[]
): { score: number; matchedSkills: string[]; breakdown: Record<string, MatchBreakdown> } {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const matchedSkills: string[] = [];
  const breakdown: Record<string, MatchBreakdown> = {};

  const skillMap: Record<string, EmployeeSkill> = {};
  employeeSkills.forEach(s => {
    skillMap[s.skill_name.toLowerCase()] = s;
  });

  // Custom service skills (higher weight)
  serviceSkills.forEach(req => {
    const weight = req.importance_level === 'required' ? 2.0
      : req.importance_level === 'preferred' ? 1.0 : 0.5;

    maxPossibleScore += 100 * weight;
    const emp = skillMap[req.skill_name.toLowerCase()];
    if (emp) {
      let skillScore = emp.proficiency_level * weight;
      if (emp.proficiency_level >= req.min_proficiency) skillScore += 10 * weight;
      const expBonus = Math.min(20, (emp.years_experience || 0) * 2) * weight;
      skillScore += expBonus;
      totalScore += skillScore;
      matchedSkills.push(req.skill_name);
      breakdown[req.skill_name] = {
        proficiency: emp.proficiency_level,
        years_experience: emp.years_experience,
        score: skillScore,
        importance: req.importance_level,
      };
    }
  });

  // Catalog skills (lower weight, skip if already in custom)
  const customNames = new Set(serviceSkills.map(s => s.skill_name.toLowerCase()));
  catalogSkills.forEach(name => {
    if (customNames.has(name.toLowerCase())) return;
    maxPossibleScore += 50;
    const emp = skillMap[name.toLowerCase()];
    if (emp) {
      const skillScore = emp.proficiency_level * 0.5;
      const expBonus = Math.min(10, emp.years_experience || 0);
      totalScore += skillScore + expBonus;
      matchedSkills.push(name);
      breakdown[name] = {
        proficiency: emp.proficiency_level,
        years_experience: emp.years_experience,
        score: skillScore + expBonus,
        importance: 'catalog-default',
      };
    }
  });

  const normalizedScore = maxPossibleScore > 0
    ? Math.min(100, (totalScore / maxPossibleScore) * 100)
    : 0;

  return {
    score: Math.round(normalizedScore * 100) / 100,
    matchedSkills,
    breakdown,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Optionally scope to a single service
    let targetServiceId: string | null = null;
    try {
      const body = await req.json();
      targetServiceId = body?.service_id || null;
    } catch { /* no body */ }

    // Get active services with their skills
    let servicesQuery = supabase
      .from('services')
      .select(`
        id,
        service_catalog_id,
        catalog:service_catalog!services_service_catalog_id_fkey(typical_skills),
        skills:service_skills(skill_name, importance_level, min_proficiency)
      `)
      .eq('is_active', true);

    if (targetServiceId) {
      servicesQuery = servicesQuery.eq('id', targetServiceId);
    }

    const { data: services, error: sErr } = await servicesQuery;
    if (sErr) throw sErr;

    // Get all active employee skills
    const { data: allEmployeeSkills, error: esErr } = await supabase
      .from('employee_skills')
      .select('user_id, skill_name, proficiency_level, years_experience');
    if (esErr) throw esErr;

    // Group by user_id
    const skillsByUser: Record<string, EmployeeSkill[]> = {};
    (allEmployeeSkills || []).forEach(s => {
      if (!skillsByUser[s.user_id]) skillsByUser[s.user_id] = [];
      skillsByUser[s.user_id].push(s);
    });

    let totalMatches = 0;

    for (const service of (services || [])) {
      const catalogSkills: string[] = (service as any).catalog?.typical_skills || [];
      const customSkills: ServiceSkill[] = (service as any).skills || [];

      if (catalogSkills.length === 0 && customSkills.length === 0) continue;

      const upserts: any[] = [];

      for (const [userId, empSkills] of Object.entries(skillsByUser)) {
        const result = calculateMatch(empSkills, customSkills, catalogSkills);
        if (result.score >= 60) {
          upserts.push({
            service_id: service.id,
            user_id: userId,
            match_score: result.score,
            matched_skills: result.matchedSkills,
            skill_breakdown: result.breakdown,
            auto_matched: true,
            is_active: true,
            last_updated: new Date().toISOString(),
          });
        }
      }

      if (upserts.length > 0) {
        const { error: uErr } = await supabase
          .from('service_talent_matches')
          .upsert(upserts, { onConflict: 'service_id,user_id' });
        if (!uErr) totalMatches += upserts.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, servicesProcessed: services?.length || 0, matchesCreated: totalMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
