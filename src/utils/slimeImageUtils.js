import {
  SLIME_EVOLUTION_TREE,
  SLIME_FALLBACK_IMAGE,
  getAllEvolutionNodes,
  getEvolutionNodeById,
} from '../constants/slimeEvolutionConstants'
import { safeNumber } from './habitUtils'

const COMMON_BASE_NODE_ID = 'common-sprout'
const COMMON_ADVENTURER_NODE_ID = 'common-adventurer'

function getSafeProfile(profile) {
  return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {}
}

function getSafeLevel(profile) {
  return Math.max(1, Math.floor(safeNumber(getSafeProfile(profile).level, 1)))
}

function getCommonBaseNode() {
  return getEvolutionNodeById(COMMON_BASE_NODE_ID)
}

function getCommonAdventurerNode() {
  return getEvolutionNodeById(COMMON_ADVENTURER_NODE_ID)
}

function getClassTree(classLine) {
  return SLIME_EVOLUTION_TREE.find((tree) => tree.classId === classLine) ?? null
}

function getFirstJobNodes() {
  return SLIME_EVOLUTION_TREE
    .filter((tree) => tree.classId !== 'common')
    .flatMap((tree) => tree.nodes ?? [])
    .filter((node) => node.stage === 1)
}

function getBranchNodes(classLine, branchLine) {
  const classTree = getClassTree(classLine)
  if (!classTree) {
    return []
  }

  if (branchLine) {
    return (classTree.branches ?? [])
      .filter((branch) => branch.id === branchLine)
      .flatMap((branch) => branch.nodes ?? [])
  }

  return (classTree.branches ?? []).flatMap((branch) => branch.nodes ?? [])
}

function getBestUnlockedNode(nodes, level) {
  return [...nodes]
    .filter((node) => safeNumber(node.unlockLevel) <= level)
    .sort((left, right) => safeNumber(right.unlockLevel) - safeNumber(left.unlockLevel) || safeNumber(right.stage) - safeNumber(left.stage))[0] ?? null
}

function getSelectedNode(profile) {
  const selectedNodeId = getSafeProfile(profile).selectedEvolutionNodeId
  return typeof selectedNodeId === 'string' ? getEvolutionNodeById(selectedNodeId) : null
}

function getNodeByClassBranchLevel(profile) {
  const safeProfile = getSafeProfile(profile)
  const level = getSafeLevel(safeProfile)
  const classLine = typeof safeProfile.classLine === 'string' ? safeProfile.classLine : null
  const branchLine = typeof safeProfile.branchLine === 'string' ? safeProfile.branchLine : null

  if (level < 5) {
    return getCommonBaseNode()
  }

  if (level < 10 || !classLine) {
    return getCommonAdventurerNode() ?? getCommonBaseNode()
  }

  const classTree = getClassTree(classLine)
  if (!classTree) {
    return getCommonAdventurerNode() ?? getCommonBaseNode()
  }

  const classNodes = classTree.nodes ?? []
  const branchNodes = getBranchNodes(classLine, branchLine)
  const bestBranchNode = getBestUnlockedNode(branchNodes, level)
  if (bestBranchNode) {
    return bestBranchNode
  }

  return getBestUnlockedNode(classNodes, level) ?? getCommonAdventurerNode() ?? getCommonBaseNode()
}

export function getCurrentEvolutionNode(profile) {
  return getSelectedNode(profile) ?? getNodeByClassBranchLevel(profile)
}

export function getSlimeImagePath(profile) {
  const selectedNode = getSelectedNode(profile)
  if (selectedNode?.image) {
    return selectedNode.image
  }

  const matchedNode = getNodeByClassBranchLevel(profile)
  if (matchedNode?.image) {
    return matchedNode.image
  }

  const adventurerNode = getCommonAdventurerNode()
  if (adventurerNode?.image) {
    return adventurerNode.image
  }

  const baseNode = getCommonBaseNode()
  if (baseNode?.image) {
    return baseNode.image
  }

  return SLIME_FALLBACK_IMAGE
}

export function getSlimeDisplayName(profile) {
  return getCurrentEvolutionNode(profile)?.nameKo ?? '새싹 슬라임'
}

export function getNextEvolutionTargets(profile) {
  const safeProfile = getSafeProfile(profile)
  const level = getSafeLevel(safeProfile)
  const classLine = typeof safeProfile.classLine === 'string' ? safeProfile.classLine : null
  const branchLine = typeof safeProfile.branchLine === 'string' ? safeProfile.branchLine : null

  if (level < 10 || !classLine) {
    return getFirstJobNodes()
  }

  if (level < 25 || !branchLine) {
    return getBranchNodes(classLine, null).filter((node) => node.stage === 2)
  }

  if (level < 40) {
    return getBranchNodes(classLine, branchLine).filter((node) => node.stage === 3)
  }

  if (level < 60) {
    return getBranchNodes(classLine, branchLine).filter((node) => node.stage === 4)
  }

  return []
}

export function getEvolutionProgressInfo(profile) {
  const currentNode = getCurrentEvolutionNode(profile)
  const nextTargets = getNextEvolutionTargets(profile)
  const level = getSafeLevel(profile)
  const nextUnlockLevel = nextTargets.length > 0
    ? Math.min(...nextTargets.map((node) => safeNumber(node.unlockLevel, Infinity)))
    : null

  return {
    currentNode,
    currentStage: currentNode?.stage ?? 0,
    nextUnlockLevel,
    remainingLevels: nextUnlockLevel == null ? 0 : Math.max(0, nextUnlockLevel - level),
    nextTargets,
    nextTargetNames: nextTargets.map((node) => node.nameKo),
    allNodes: getAllEvolutionNodes(),
  }
}
