import { cleanObject, ensureArray, getClientResult, mapSupabaseResult, missingUserIdResult } from './serviceUtils'

function slimeProfileFromRow(row) {
  return {
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    totalXp: row.total_xp ?? 0,
    gold: row.gold ?? 0,
    crystals: row.crystals ?? 0,
    energy: row.energy ?? 50,
    maxEnergy: row.max_energy ?? 100,
    evolutionStage: row.evolution_stage ?? 'baby',
    classLine: row.class_line,
    branchLine: row.branch_line,
    selectedEvolutionNodeId: row.selected_evolution_node_id,
    growthLog: ensureArray(row.growth_log),
    unlockedRewards: ensureArray(row.unlocked_rewards),
    updatedAt: row.updated_at,
  }
}

function slimeProfileToRow(userId, profile) {
  return cleanObject({
    user_id: userId,
    level: profile.level,
    xp: profile.xp,
    total_xp: profile.totalXp,
    gold: profile.gold,
    crystals: profile.crystals,
    energy: profile.energy,
    max_energy: profile.maxEnergy,
    evolution_stage: profile.evolutionStage,
    class_line: profile.classLine,
    branch_line: profile.branchLine,
    selected_evolution_node_id: profile.selectedEvolutionNodeId,
    growth_log: profile.growthLog,
    unlocked_rewards: profile.unlockedRewards,
  })
}

export async function getSlimeProfile(userId) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('slime_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return mapSupabaseResult(result, slimeProfileFromRow)
}

export async function upsertSlimeProfile(userId, profile) {
  if (!userId) return missingUserIdResult()
  const { client, error } = await getClientResult()
  if (error) return { data: null, error }

  const result = await client
    .from('slime_profiles')
    .upsert(slimeProfileToRow(userId, profile))
    .select()
    .single()

  return mapSupabaseResult(result, slimeProfileFromRow)
}
