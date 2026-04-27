import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { SLIME_EVOLUTION_TREE } from '../../constants/slimeEvolutionConstants'
import { getCurrentEvolutionNode } from '../../utils/slimeImageUtils'
import EvolutionNodeCard from './EvolutionNodeCard'

const CLASS_ORDER = ['warrior', 'rogue', 'mage', 'archer']

const CLASS_SUMMARY = {
  warrior: {
    title: '전사 계열',
    description: '단단한 체력과 전투 집중력을 키우는 진화 라인입니다. 검, 방패, 창 중 원하는 전투 스타일로 성장합니다.',
    focus: 'Strength / Guard / Discipline',
  },
  rogue: {
    title: '도적 계열',
    description: '민첩함과 집중력을 바탕으로 빠르게 성장하는 진화 라인입니다. 단검, 표창, 괴도 분기로 이어집니다.',
    focus: 'Agility / Focus / Treasure',
  },
  mage: {
    title: '마법사 계열',
    description: '습관의 꾸준함을 지식과 마력으로 바꾸는 진화 라인입니다. 화염, 빙결, 성광 분기를 선택할 수 있습니다.',
    focus: 'Wisdom / Recovery / Magic',
  },
  archer: {
    title: '궁수 계열',
    description: '정확함과 루틴 감각을 살려 멀리 성장하는 진화 라인입니다. 장궁, 석궁, 자연 분기로 발전합니다.',
    focus: 'Precision / Rhythm / Nature',
  },
}

export default function EvolutionTreeModal({ profile, onClose }) {
  const currentNode = getCurrentEvolutionNode(profile)
  const level = profile?.level ?? 1
  const commonTree = SLIME_EVOLUTION_TREE.find((tree) => tree.classId === 'common')
  const classTrees = SLIME_EVOLUTION_TREE.filter((tree) => CLASS_ORDER.includes(tree.classId))
    .sort((left, right) => CLASS_ORDER.indexOf(left.classId) - CLASS_ORDER.indexOf(right.classId))
  const [activeClassId, setActiveClassId] = useState(profile?.classLine && CLASS_ORDER.includes(profile.classLine) ? profile.classLine : classTrees[0]?.classId)
  const activeClassTree = useMemo(
    () => classTrees.find((tree) => tree.classId === activeClassId) ?? classTrees[0],
    [activeClassId, classTrees],
  )
  const activeClassSummary = CLASS_SUMMARY[activeClassTree?.classId] ?? {
    title: activeClassTree?.nameKo ?? 'Class Path',
    description: '선택한 직업의 진화 단계와 분기를 확인할 수 있습니다.',
    focus: 'Growth',
  }
  const activeClassImage = activeClassTree?.nodes?.[0]?.image

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-overlay evolution-tree-overlay" role="presentation" onMouseDown={onClose}>
      <section className="evolution-tree-modal" role="dialog" aria-modal="true" aria-labelledby="evolution-tree-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="evolution-tree-modal__head">
          <div>
            <span>Companion Growth</span>
            <h2 id="evolution-tree-title">Slime Evolution Tree</h2>
          </div>
          <button type="button" className="modal-icon-button" onClick={onClose} aria-label="Close evolution tree">
            <X size={18} />
          </button>
        </div>

        <div className="evolution-tree-modal__body">
          <section className="evolution-tree-section">
            <div className="evolution-tree-section__head">
              <strong>Common Path</strong>
              <span>새싹 슬라임에서 초보 모험 슬라임까지</span>
            </div>
            <div className="evolution-common-path">
              {(commonTree?.nodes ?? []).map((node) => (
                <EvolutionNodeCard key={node.id} node={node} level={level} isCurrent={currentNode?.id === node.id} />
              ))}
            </div>
          </section>

          <section className="evolution-tree-section">
            <div className="evolution-tree-section__head">
              <strong>Class Paths</strong>
              <span>직업을 누르면 크게 볼 수 있습니다</span>
            </div>

            <div className="evolution-class-tabs" role="tablist" aria-label="Slime classes">
              {classTrees.map((classTree) => (
                <button
                  key={classTree.classId}
                  type="button"
                  role="tab"
                  aria-selected={activeClassTree?.classId === classTree.classId}
                  className={activeClassTree?.classId === classTree.classId ? 'evolution-class-tab is-active' : 'evolution-class-tab'}
                  onClick={() => setActiveClassId(classTree.classId)}
                  onFocus={() => setActiveClassId(classTree.classId)}
                  onMouseEnter={() => setActiveClassId(classTree.classId)}
                >
                  {classTree.nameKo}
                  <span>{classTree.nameEn}</span>
                </button>
              ))}
            </div>

            {activeClassTree ? (
              <div className="evolution-class-tree">
                <div key={activeClassTree.classId} className="evolution-class-spotlight" aria-live="polite">
                  <div className="evolution-class-spotlight__image">
                    {activeClassImage ? <img src={activeClassImage} alt={`${activeClassTree.nameKo} preview`} /> : <span>SLIME</span>}
                  </div>
                  <div className="evolution-class-spotlight__body">
                    <span>{activeClassTree.nameEn}</span>
                    <strong>{activeClassSummary.title}</strong>
                    <p>{activeClassSummary.description}</p>
                    <div className="evolution-class-spotlight__meta">
                      <em>{activeClassSummary.focus}</em>
                      <em>{(activeClassTree.branches ?? []).map((branch) => branch.nameKo).join(' / ')}</em>
                    </div>
                  </div>
                </div>

                <div className="evolution-first-job">
                  {(activeClassTree.nodes ?? []).map((node) => (
                    <EvolutionNodeCard key={node.id} node={node} level={level} isCurrent={currentNode?.id === node.id} />
                  ))}
                </div>

                <div className="evolution-branch-grid">
                  {(activeClassTree.branches ?? []).map((branch) => (
                    <div key={branch.id} className="evolution-branch-column">
                      <div className="evolution-branch-column__head">
                        <strong>{branch.nameKo}</strong>
                        <span>{branch.nameEn}</span>
                      </div>
                      <div className="evolution-branch-nodes">
                        {(branch.nodes ?? []).map((node) => (
                          <EvolutionNodeCard key={node.id} node={node} level={level} isCurrent={currentNode?.id === node.id} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </div>
  )
}
