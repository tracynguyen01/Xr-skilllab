import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title === 'XR SkillLab' ? title : `${title} · XR SkillLab`
  }, [title])
}
