/** 课程项目：每门课一个 DSH 工作区，资料在 materials/，导师会话挂在这个工作区。 */
import type { Course, ProjectInfo } from '../api'
import { Button, ErrorBox, Loading, Modal } from '../ui'

export function ProjectModal({ open, course, project, error, busy, onClose, onOpenProject, onOpenTutor, onRetry, notify }: {
  open: boolean
  course: Course | null
  project: ProjectInfo | null
  error: string | null
  busy: boolean
  onClose: () => void
  onOpenProject: () => void
  onOpenTutor: () => void
  onRetry: () => void
  notify: (message: string) => void
}) {
  if (!open) return null

  const copyPath = async () => {
    if (!project?.path) return
    try {
      await navigator.clipboard.writeText(project.path)
      notify('项目路径已复制')
    } catch {
      notify('复制失败，可以手动选中路径')
    }
  }

  return (
    <Modal
      title="课程项目"
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>关闭</Button>
          <Button onClick={onOpenProject} disabled={!project?.workspaceId}>打开项目</Button>
          <Button variant="primary" onClick={onOpenTutor} disabled={!project?.workspaceId}>打开导师会话</Button>
        </>
      )}
    >
      <div className="eg-project-intro">
        <b>{course?.name || '当前课程'}</b>
        <span>每门课一个独立 DSH 工作区，资料都在项目的 materials/ 目录；导师会话也挂在这个工作区里。</span>
      </div>
      {error ? <ErrorBox error={error} /> : null}
      {!project && !error ? <Loading text={busy ? '正在建立课程项目…' : '正在读取课程项目…'} /> : null}
      {project ? (
        <>
          <div className="eg-project-meta">
            <div><span>项目路径</span><code>{project.path}</code></div>
            <div><span>资料</span><b>{project.materials} 个文件</b></div>
            <div><span>导师会话</span><b>独立 DSH 会话 · 这个项目工作区</b></div>
          </div>
          {project.files.length ? (
            <div className="eg-project-files">
              {project.files.slice(0, 8).map((file) => (
                <div className="eg-project-file" key={file.name}>
                  <span>{file.name}</span>
                  <small>{file.kind || '资料'}{file.pages ? ` · ${file.pages} 页` : ''}</small>
                </div>
              ))}
              {project.files.length > 8 ? <div className="eg-project-more">还有 {project.files.length - 8} 个资料在 materials/ 里</div> : null}
            </div>
          ) : <div className="eg-card-hint">这门课还没有资料；上传后重新打开项目就会同步。</div>}
          <div className="eg-row">
            <Button size="sm" onClick={copyPath}>复制项目路径</Button>
            <Button size="sm" onClick={onRetry} disabled={busy}>重新同步资料</Button>
          </div>
          <div className="eg-card-hint">
            「打开项目」进入项目工作区；「打开导师会话」直接打开这条独立 DSH 会话。两者都会离开学习面板，返回学习后进度不变。
          </div>
        </>
      ) : null}
      {error ? <Button size="sm" onClick={onRetry}>重试</Button> : null}
    </Modal>
  )
}
