window.__ModuleLoader__.load({
  id: "edugraph-learning",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    ;(function (module, exports, require) {
/* EduGraph AI 学习模式 · 浏览器侧 bundle（由 scripts/build-client.mjs 生成，请勿手改） */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  LearningIcon: () => LearningIcon,
  LearningPanel: () => LearningPanel,
  PANEL_ID: () => PANEL_ID,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react8 = require("react");

// src/client/styles.css
var styles_default = "/* EduGraph AI \u5B66\u4E60\u6A21\u5F0F \xB7 \u9762\u677F\u6837\u5F0F\n   \u8BBE\u8BA1\u8BED\u8A00\uFF1A\u975B\u84DD\u4E3B\u8272 + \u8584\u8377\u8F85\u8272\uFF0C\u67D4\u548C\u7684\u5C42\u7EA7\u5361\u7247\u3001\u73BB\u7483\u8D28\u611F\u9876\u680F\u3001\u53EF\u6536\u8D77\u7684\u53F3\u4FA7 AI \u5BFC\u5E08\u3002\n   \u989C\u8272\u4EE5 DSH \u4E3B\u9898\u4EE4\u724C\u4E3A\u5E95\uFF0C\u4EAE/\u6697\u81EA\u52A8\u9002\u914D\u3002 */\n\n/* ================================================================ \u5916\u58F3 */\n\n.eg-app {\n  --eg-canvas: var(--dsw-alias-bg-base, #ffffff);\n  --eg-bg: var(--eg-canvas);\n  --eg-layer: var(--dsw-alias-bg-layer-1, #fbfbfd);\n  --eg-layer2: var(--dsw-alias-bg-layer-2, #f4f5f9);\n  --eg-layer3: var(--dsw-alias-bg-layer-3, #e9ebf1);\n  --eg-border: color-mix(in oklab, var(--eg-text) 9%, transparent);\n  --eg-border-strong: color-mix(in oklab, var(--eg-text) 17%, transparent);\n  --eg-text: var(--dsw-alias-label-primary, #171923);\n  --eg-text-2: var(--dsw-alias-label-secondary, #4d5260);\n  --eg-text-3: var(--dsw-alias-label-tertiary, #878d9c);\n  --eg-brand: #6a5ae0;\n  --eg-brand-deep: color-mix(in oklab, var(--eg-brand) 78%, #15122c);\n  --eg-brand-soft: color-mix(in srgb, var(--eg-brand) 11%, transparent);\n  --eg-accent: #10b6a3;\n  --eg-success: var(--dsw-alias-state-success-primary, #13996a);\n  --eg-warn: var(--dsw-alias-state-warn-primary, #c07c12);\n  --eg-error: var(--dsw-alias-state-error-primary, #d64545);\n  --eg-info: var(--dsw-alias-state-business-primary, #3f6ad8);\n  --eg-radius: 16px;\n  --eg-radius-sm: 10px;\n  --eg-shadow-sm: 0 1px 2px rgba(18, 20, 45, 0.04), 0 14px 34px -26px rgba(18, 20, 45, 0.4);\n  --eg-shadow: 0 30px 70px -40px rgba(18, 20, 45, 0.45), 0 2px 8px rgba(18, 20, 45, 0.05);\n\n  display: block;\n  height: 100%;\n  min-height: 0;\n  background: var(--eg-canvas);\n  color: var(--eg-text);\n  font-size: 14px;\n  line-height: 1.55;\n  overflow: hidden;\n  position: relative;\n  container-type: inline-size;\n}\n\n/* \u5B66\u4E60\u9762\u677F\u81EA\u5DF1\u7684\u7F51\u683C\uFF1B\u7528\u5BB9\u5668\u67E5\u8BE2\u6309\u9762\u677F\u5B9E\u9645\u5BBD\u5EA6\u6536\u653E\uFF0C\u800C\u4E0D\u662F\u6309\u6574\u4E2A\u7A97\u53E3\u3002 */\n.eg-shell {\n  display: grid;\n  grid-template-columns: 252px minmax(0, 1fr);\n  height: 100%;\n  min-height: 0;\n}\n.eg-app[data-chat='true'] .eg-shell { grid-template-columns: 252px minmax(0, 1fr) clamp(348px, 30cqi, 430px); }\n.eg-app * { box-sizing: border-box; }\n.eg-app :focus-visible { outline: 2px solid color-mix(in srgb, var(--eg-brand) 58%, transparent); outline-offset: 2px; border-radius: 8px; }\nbody[data-ds-dark-theme] .eg-app {\n  --eg-shadow-sm: 0 1px 0 rgba(255, 255, 255, 0.03), 0 16px 40px -28px #000000;\n  --eg-shadow: 0 30px 70px -40px #000000, 0 1px 0 rgba(255, 255, 255, 0.04);\n}\n\n/* ================================================================ \u5DE6\u4FA7\u5BFC\u822A */\n\n.eg-rail {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  scrollbar-width: none;\n  padding: calc(var(--dsh-frame-top-clearance, 0px) + 18px) 14px 14px;\n  border-right: 1px solid var(--eg-border);\n  background:\n    radial-gradient(120% 70% at 0% 0%, color-mix(in srgb, var(--eg-brand) 9%, transparent), transparent 55%),\n    linear-gradient(180deg, color-mix(in srgb, var(--eg-layer) 92%, var(--eg-brand) 3%), var(--eg-layer));\n}\n.eg-rail::-webkit-scrollbar { display: none; }\n\n.eg-brand { flex: none; display: flex; align-items: center; gap: 11px; padding: 0 4px 18px; }\n.eg-brand-button { width: 100%; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }\n.eg-brand-button:hover .eg-brand-name { color: var(--eg-brand); }\n.eg-brand-mark {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex: none;\n  color: #fff;\n  border-radius: 13px;\n  background: linear-gradient(135deg, #5a55e0, #8b5cf6 52%, #14b8a6);\n  box-shadow: 0 12px 26px -14px color-mix(in srgb, var(--eg-brand) 75%, transparent);\n  overflow: hidden;\n}\n.eg-brand-mark::after {\n  content: '';\n  position: absolute;\n  inset: 1px 1px auto;\n  height: 52%;\n  border-radius: 12px 12px 40% 40%;\n  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);\n  pointer-events: none;\n}\n.eg-brand-text { min-width: 0; }\n.eg-brand-name { font-size: 17px; font-weight: 760; letter-spacing: -0.3px; line-height: 1.1; }\n.eg-brand-sub { margin-top: 3px; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--eg-text-3); white-space: nowrap; }\n\n.eg-rail-course {\n  position: relative;\n  flex: none;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  margin-bottom: 14px;\n  padding: 12px;\n  border: 1px solid var(--eg-border);\n  border-radius: 18px;\n  overflow: hidden;\n  background: color-mix(in srgb, var(--eg-layer) 70%, transparent);\n  box-shadow: var(--eg-shadow-sm);\n}\n.eg-rail-course::before {\n  content: '';\n  position: absolute;\n  top: -60px;\n  right: -44px;\n  width: 130px;\n  height: 130px;\n  border-radius: 50%;\n  background: radial-gradient(circle, color-mix(in srgb, var(--eg-brand) 20%, transparent), transparent 70%);\n  pointer-events: none;\n}\n.eg-rail-course-head { position: relative; display: flex; align-items: center; gap: 10px; }\n.eg-rail-course-icon {\n  flex: none;\n  width: 32px;\n  height: 32px;\n  display: grid;\n  place-items: center;\n  border-radius: 10px;\n  background: var(--eg-brand-soft);\n  color: var(--eg-brand);\n}\n.eg-rail-course-text { flex: 1; min-width: 0; }\n.eg-rail-course-name { font-size: 13px; font-weight: 660; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.eg-rail-course-sub { font-size: 11px; color: var(--eg-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n.eg-course-picker {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 8px 6px 10px;\n  border: 1px solid var(--eg-border);\n  border-radius: 10px;\n  background: var(--eg-canvas);\n  color: var(--eg-text-3);\n  font-size: 10.5px;\n}\n.eg-course-picker > span { flex: none; white-space: nowrap; letter-spacing: 0.04em; }\n.eg-course-picker select {\n  flex: 1;\n  min-width: 0;\n  border: 0;\n  outline: 0;\n  background: transparent;\n  color: var(--eg-text-2);\n  font: inherit;\n  font-size: 12px;\n  font-weight: 560;\n  cursor: pointer;\n}\n\n.eg-rail-progress { display: flex; align-items: center; gap: 10px; }\n.eg-rail-progress-text { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }\n.eg-rail-progress-text b { font-size: 15px; font-weight: 720; letter-spacing: -0.02em; }\n.eg-rail-progress-text span { font-size: 10px; color: var(--eg-text-3); }\n.eg-rail-due {\n  margin-left: auto;\n  padding: 3px 7px;\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--eg-warn) 12%, transparent);\n  color: var(--eg-warn);\n  font-size: 10px;\n  font-weight: 650;\n  white-space: nowrap;\n}\n\n.eg-rail-empty {\n  flex: none;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 8px;\n  margin-bottom: 14px;\n  padding: 16px 14px;\n  border: 1px dashed var(--eg-border-strong);\n  border-radius: 18px;\n  background: color-mix(in srgb, var(--eg-layer) 60%, transparent);\n}\n.eg-rail-empty-icon {\n  width: 34px;\n  height: 34px;\n  display: grid;\n  place-items: center;\n  border-radius: 11px;\n  background: var(--eg-brand-soft);\n  color: var(--eg-brand);\n}\n.eg-rail-empty b { font-size: 13px; }\n.eg-rail-empty span { font-size: 11.5px; line-height: 1.5; color: var(--eg-text-3); }\n\n.eg-nav { flex: none; display: flex; flex-direction: column; gap: 2px; }\n.eg-nav-group {\n  padding: 12px 10px 6px;\n  font-size: 10px;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n  color: var(--eg-text-3);\n}\n.eg-nav-item {\n  position: relative;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 10px;\n  border: 0;\n  border-radius: 11px;\n  background: transparent;\n  color: var(--eg-text-2);\n  font: inherit;\n  font-size: 13px;\n  font-weight: 560;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;\n}\n.eg-nav-item:hover { background: color-mix(in srgb, var(--eg-text) 5%, transparent); color: var(--eg-text); transform: translateX(1px); }\n.eg-nav-item[data-active='true'] {\n  color: var(--eg-brand-deep);\n  background: linear-gradient(90deg, color-mix(in srgb, var(--eg-brand) 12%, transparent), color-mix(in srgb, var(--eg-brand) 3%, transparent));\n}\n.eg-nav-item[data-active='true']::before {\n  content: '';\n  position: absolute;\n  left: -14px;\n  top: 9px;\n  bottom: 9px;\n  width: 3px;\n  border-radius: 0 4px 4px 0;\n  background: linear-gradient(180deg, var(--eg-brand), var(--eg-accent));\n}\n.eg-nav-icon {\n  flex: none;\n  width: 24px;\n  height: 24px;\n  display: grid;\n  place-items: center;\n  border-radius: 8px;\n  color: var(--eg-text-3);\n  transition: background 0.16s ease, color 0.16s ease;\n}\n.eg-nav-item[data-active='true'] .eg-nav-icon { background: color-mix(in srgb, var(--eg-brand) 14%, transparent); color: var(--eg-brand); }\n.eg-nav-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.eg-nav-badge {\n  min-width: 18px;\n  height: 18px;\n  padding: 0 5px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 9px;\n  background: linear-gradient(135deg, #f97373, #e5484d);\n  color: #fff;\n  font-size: 10.5px;\n  font-weight: 700;\n}\n.eg-nav-hint { padding: 10px 10px 0; font-size: 11px; line-height: 1.6; color: var(--eg-text-3); }\n\n.eg-rail-foot {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  margin-top: auto;\n  padding-top: 14px;\n  border-top: 1px solid var(--eg-border);\n}\n.eg-rail-note {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 10px 0;\n  font-size: 10px;\n  color: var(--eg-text-3);\n  white-space: nowrap;\n}\n\n.eg-live-dot {\n  flex: none;\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  background: var(--eg-success);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--eg-success) 14%, transparent);\n  animation: eg-live 2.6s ease-in-out infinite;\n}\n.eg-live-dot[data-tone='warn'] { background: var(--eg-warn); box-shadow: 0 0 0 3px color-mix(in srgb, var(--eg-warn) 14%, transparent); }\n.eg-live-dot[data-tone='error'] { background: var(--eg-error); box-shadow: 0 0 0 3px color-mix(in srgb, var(--eg-error) 14%, transparent); animation: none; }\n@keyframes eg-live { 0%, 100% { opacity: 1; } 50% { opacity: 0.42; } }\n\n/* ================================================================ \u4E3B\u533A\u57DF */\n\n.eg-stage {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  background:\n    radial-gradient(120% 55% at 8% -10%, color-mix(in srgb, var(--eg-brand) 7%, transparent), transparent 60%),\n    radial-gradient(80% 46% at 100% 0%, color-mix(in srgb, var(--eg-accent) 6%, transparent), transparent 55%),\n    var(--eg-canvas);\n}\n\n.eg-topbar {\n  position: relative;\n  z-index: 3;\n  flex: none;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: calc(var(--dsh-frame-top-clearance, 0px) + 12px) 22px 12px;\n  border-bottom: 1px solid color-mix(in srgb, var(--eg-border) 72%, transparent);\n  background: color-mix(in srgb, var(--eg-canvas) 74%, transparent);\n  backdrop-filter: blur(18px) saturate(1.2);\n}\n.eg-crumbs { display: flex; flex-wrap: nowrap; align-items: center; gap: 7px; min-width: 0; overflow: hidden; font-size: 12px; color: var(--eg-text-3); }\n.eg-crumb-root { flex: none; white-space: nowrap; }\n.eg-crumbs b { flex: 0 1 auto; min-width: 0; max-width: min(28cqi, 260px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px; font-weight: 650; color: var(--eg-text); }\n.eg-crumbs > span:last-child { flex: none; white-space: nowrap; }\n.eg-crumb-sep { flex: none; opacity: 0.5; }\n.eg-top-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; flex: none; }\n.eg-chat-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  height: 30px;\n  padding: 0 12px;\n  border: 1px solid color-mix(in srgb, var(--eg-brand) 22%, var(--eg-border));\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--eg-brand) 6%, var(--eg-canvas));\n  color: var(--eg-brand-deep);\n  font: inherit;\n  font-size: 12px;\n  font-weight: 640;\n  cursor: pointer;\n  transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;\n}\n.eg-chat-toggle:hover { background: color-mix(in srgb, var(--eg-brand) 11%, var(--eg-canvas)); border-color: color-mix(in srgb, var(--eg-brand) 36%, var(--eg-border)); }\n.eg-chat-toggle[data-open='true'] {\n  border-color: transparent;\n  color: #fff;\n  background: linear-gradient(135deg, var(--eg-brand), color-mix(in oklab, var(--eg-brand) 55%, var(--eg-accent)));\n  box-shadow: 0 10px 22px -14px color-mix(in srgb, var(--eg-brand) 75%, transparent);\n}\n.eg-chat-toggle .eg-live-dot { width: 5px; height: 5px; }\n.eg-chat-toggle[data-open='true'] .eg-live-dot { background: #fff; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18); }\n\n.eg-icon-btn {\n  flex: none;\n  width: 30px;\n  height: 30px;\n  display: inline-grid;\n  place-items: center;\n  border: 1px solid transparent;\n  border-radius: 9px;\n  background: transparent;\n  color: var(--eg-text-3);\n  cursor: pointer;\n  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;\n}\n.eg-icon-btn:hover { background: var(--eg-layer3); color: var(--eg-text); }\n.eg-icon-btn.sm { width: 26px; height: 26px; border-radius: 8px; }\n.eg-settings-compact { display: none; }\n\n.eg-main { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 4px 22px 44px; scrollbar-gutter: stable; }\n.eg-main::-webkit-scrollbar { width: 10px; height: 10px; }\n.eg-main::-webkit-scrollbar-track { background: transparent; }\n.eg-main::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--eg-text) 16%, transparent); border: 3px solid transparent; border-radius: 999px; background-clip: content-box; }\n.eg-main::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--eg-text) 26%, transparent); border: 3px solid transparent; background-clip: content-box; }\n.eg-main-inner { max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; container-type: inline-size; animation: eg-rise 0.38s cubic-bezier(0.22, 1, 0.36, 1); }\n@keyframes eg-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }\n\n.eg-grid { display: grid; gap: 14px; }\n.eg-grid.cols-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }\n.eg-grid.cols-3 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }\n.eg-grid.cols-4 { grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }\n.eg-course-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }\n.eg-stat-grid { grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }\n@container (max-width: 720px) {\n  .eg-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n}\n@container (max-width: 420px) {\n  .eg-stat-grid { grid-template-columns: minmax(0, 1fr); }\n}\n\n/* ================================================================ \u5361\u7247 / \u7EDF\u8BA1 */\n\n.eg-card {\n  position: relative;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 18px;\n  border: 1px solid var(--eg-border);\n  border-radius: var(--eg-radius);\n  background: color-mix(in srgb, var(--eg-layer) 78%, var(--eg-canvas));\n  box-shadow: var(--eg-shadow-sm);\n}\n.eg-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }\n.eg-card-title { font-size: 13px; font-weight: 680; color: var(--eg-text); }\n.eg-card-hint { margin-top: 2px; font-size: 11.5px; color: var(--eg-text-3); }\n\n.eg-stat {\n  position: relative;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  padding: 16px 16px 14px;\n  overflow: hidden;\n  border: 1px solid var(--eg-border);\n  border-radius: var(--eg-radius);\n  background: color-mix(in srgb, var(--eg-layer) 78%, var(--eg-canvas));\n  box-shadow: var(--eg-shadow-sm);\n}\n.eg-stat::before {\n  content: '';\n  position: absolute;\n  inset: 0 0 auto;\n  height: 3px;\n  background: linear-gradient(90deg, var(--eg-brand), color-mix(in oklab, var(--eg-brand) 18%, var(--eg-accent)));\n  opacity: 0.8;\n}\n.eg-stat-value { font-size: 30px; font-weight: 760; line-height: 1.05; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }\n.eg-stat-label { font-size: 12px; font-weight: 600; color: var(--eg-text-2); }\n.eg-stat-sub { font-size: 11px; color: var(--eg-text-3); }\n\n/* ================================================================ \u63A7\u4EF6 */\n\n.eg-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  height: 32px;\n  padding: 0 13px;\n  border: 1px solid var(--eg-border-strong);\n  border-radius: 10px;\n  background: var(--eg-canvas);\n  color: var(--eg-text);\n  font: inherit;\n  font-size: 12.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  cursor: pointer;\n  box-shadow: 0 1px 1px rgba(18, 20, 45, 0.04);\n  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;\n}\n.eg-btn:hover:not(:disabled) { background: var(--eg-layer2); border-color: color-mix(in srgb, var(--eg-brand) 30%, var(--eg-border-strong)); transform: translateY(-1px); }\n.eg-btn:active:not(:disabled) { transform: translateY(0); }\n.eg-btn:disabled { opacity: 0.45; cursor: not-allowed; }\n.eg-btn.primary {\n  border-color: transparent;\n  background: linear-gradient(135deg, var(--eg-brand), color-mix(in oklab, var(--eg-brand) 62%, var(--eg-accent)));\n  color: #fff;\n  box-shadow: 0 12px 26px -16px color-mix(in srgb, var(--eg-brand) 75%, transparent);\n}\n.eg-btn.primary:hover:not(:disabled) { background: linear-gradient(135deg, color-mix(in oklab, var(--eg-brand) 92%, #fff), color-mix(in oklab, var(--eg-brand) 55%, var(--eg-accent))); }\n.eg-btn.ghost { border-color: transparent; background: transparent; color: var(--eg-text-2); box-shadow: none; }\n.eg-btn.ghost:hover:not(:disabled) { background: color-mix(in srgb, var(--eg-text) 6%, transparent); color: var(--eg-text); }\n.eg-btn.danger { border-color: transparent; background: color-mix(in srgb, var(--eg-error) 11%, transparent); color: var(--eg-error); box-shadow: none; }\n.eg-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--eg-error) 17%, transparent); }\n.eg-btn.sm { height: 26px; padding: 0 9px; border-radius: 8px; font-size: 11.5px; }\n.eg-btn.block { width: 100%; }\n.eg-btn svg { width: 14px; height: 14px; }\n.eg-btn.eg-ask { color: var(--eg-brand); }\n.eg-btn.eg-ask:hover:not(:disabled) { background: color-mix(in srgb, var(--eg-brand) 8%, transparent); color: var(--eg-brand-deep); }\n\n.eg-input, .eg-select, .eg-textarea {\n  width: 100%;\n  border: 1px solid var(--eg-border-strong);\n  border-radius: 10px;\n  background: color-mix(in srgb, var(--eg-canvas) 88%, var(--eg-layer));\n  color: var(--eg-text);\n  font: inherit;\n  font-size: 13px;\n  padding: 8px 11px;\n  outline: none;\n  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;\n}\n.eg-input:focus, .eg-select:focus, .eg-textarea:focus {\n  border-color: color-mix(in srgb, var(--eg-brand) 60%, var(--eg-border-strong));\n  background: var(--eg-canvas);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--eg-brand) 14%, transparent);\n}\n.eg-textarea { min-height: 84px; resize: vertical; line-height: 1.6; }\n.eg-field { display: flex; flex-direction: column; gap: 5px; }\n.eg-field > label { font-size: 12px; font-weight: 600; color: var(--eg-text-2); }\n.eg-field-hint { font-size: 11px; color: var(--eg-text-3); }\n.eg-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }\n.eg-row.end { justify-content: flex-end; }\n.eg-row.between { justify-content: space-between; }\n\n/* ================================================================ \u5FBD\u6807 / \u8FDB\u5EA6 */\n\n.eg-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 9px;\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--eg-text) 5.5%, transparent);\n  color: var(--eg-text-2);\n  font-size: 11px;\n  font-weight: 600;\n  white-space: nowrap;\n}\n.eg-badge[data-tone='success'] { background: color-mix(in srgb, var(--eg-success) 13%, transparent); color: var(--eg-success); }\n.eg-badge[data-tone='warn'] { background: color-mix(in srgb, var(--eg-warn) 14%, transparent); color: var(--eg-warn); }\n.eg-badge[data-tone='error'] { background: color-mix(in srgb, var(--eg-error) 13%, transparent); color: var(--eg-error); }\n.eg-badge[data-tone='business'] { background: color-mix(in srgb, var(--eg-info) 13%, transparent); color: var(--eg-info); }\n.eg-badge[data-tone='brand'] { background: var(--eg-brand-soft); color: var(--eg-brand); }\n\n.eg-progress { height: 7px; border-radius: 999px; background: color-mix(in srgb, var(--eg-text) 8%, transparent); overflow: hidden; }\n.eg-progress > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--eg-brand), color-mix(in oklab, var(--eg-brand) 30%, var(--eg-accent))); transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1); }\n.eg-progress[data-tone='success'] > i { background: linear-gradient(90deg, var(--eg-success), color-mix(in oklab, var(--eg-success) 40%, var(--eg-accent))); }\n.eg-progress[data-tone='warn'] > i { background: linear-gradient(90deg, var(--eg-warn), color-mix(in oklab, var(--eg-warn) 45%, #f5c451)); }\n.eg-progress[data-tone='error'] > i { background: linear-gradient(90deg, var(--eg-error), color-mix(in oklab, var(--eg-error) 45%, var(--eg-warn))); }\n\n.eg-ring { flex: none; overflow: visible; }\n.eg-ring-track { stroke: color-mix(in srgb, var(--eg-text) 9%, transparent); }\n.eg-ring-fill { stroke: var(--eg-brand); transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1); }\n.eg-ring[data-tone='success'] .eg-ring-fill { stroke: var(--eg-success); }\n.eg-ring[data-tone='warn'] .eg-ring-fill { stroke: var(--eg-warn); }\n.eg-ring[data-tone='error'] .eg-ring-fill { stroke: var(--eg-error); }\n\n/* ================================================================ \u5217\u8868 */\n\n.eg-list { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--eg-border); border-radius: 14px; background: color-mix(in srgb, var(--eg-canvas) 60%, var(--eg-layer)); }\n.eg-list-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  width: 100%;\n  padding: 11px 13px;\n  border: 0;\n  border-bottom: 1px solid var(--eg-border);\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.14s ease;\n}\n.eg-list-row:last-child { border-bottom: 0; }\n.eg-list-row:hover { background: color-mix(in srgb, var(--eg-brand) 4%, transparent); }\n.eg-list-row[data-active='true'] { background: var(--eg-layer2); }\n.eg-list-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }\n.eg-list-title { font-size: 13px; font-weight: 560; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.eg-list-sub { font-size: 12px; color: var(--eg-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.eg-list-side { flex: none; display: flex; align-items: center; gap: 8px; }\n\n.eg-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--eg-text-3); }\n.eg-dot[data-tone='success'] { background: var(--eg-success); }\n.eg-dot[data-tone='warn'] { background: var(--eg-warn); }\n.eg-dot[data-tone='error'] { background: var(--eg-error); }\n.eg-dot[data-tone='brand'] { background: var(--eg-brand); }\n\n/* ================================================================ \u7A7A\u72B6\u6001 / \u52A0\u8F7D */\n\n.eg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 52px 20px; color: var(--eg-text-3); text-align: center; }\n.eg-empty svg { width: 38px; height: 38px; color: var(--eg-brand); opacity: 0.5; }\n.eg-empty-title { font-size: 14px; font-weight: 650; color: var(--eg-text-2); }\n.eg-empty-text { max-width: 440px; font-size: 12px; line-height: 1.7; }\n\n.eg-spinner {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  border: 2px solid color-mix(in srgb, var(--eg-text-3) 28%, transparent);\n  border-top-color: var(--eg-brand);\n  animation: eg-spin 0.8s linear infinite;\n}\n@keyframes eg-spin { to { transform: rotate(360deg); } }\n.eg-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 26px; font-size: 12px; color: var(--eg-text-3); }\n\n.eg-error-box {\n  padding: 11px 13px;\n  border: 1px solid color-mix(in srgb, var(--eg-error) 32%, transparent);\n  border-radius: 11px;\n  background: color-mix(in srgb, var(--eg-error) 8%, transparent);\n  color: var(--eg-error);\n  font-size: 12px;\n}\n\n/* ================================================================ \u8BFE\u7A0B\u5E93\u9996\u5C4F */\n\n.eg-hero {\n  position: relative;\n  display: grid;\n  grid-template-columns: minmax(0, 1.35fr) minmax(230px, 0.65fr);\n  align-items: center;\n  gap: 20px;\n  min-height: 250px;\n  padding: 30px 34px;\n  overflow: hidden;\n  border-radius: 24px;\n  color: #fff;\n  background:\n    radial-gradient(90% 120% at 100% 0%, rgba(20, 184, 166, 0.5), transparent 55%),\n    radial-gradient(80% 100% at 0% 100%, rgba(139, 92, 246, 0.6), transparent 55%),\n    linear-gradient(120deg, #221f45 0%, #3b2f86 46%, #115c66 100%);\n  box-shadow: 0 34px 80px -48px rgba(30, 27, 75, 0.8);\n}\n.eg-hero::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);\n  background-size: 18px 18px;\n  opacity: 0.22;\n  mask-image: linear-gradient(120deg, #000, transparent 72%);\n  pointer-events: none;\n}\n.eg-hero-copy { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 12px; max-width: 620px; }\n.eg-hero-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; color: rgba(255, 255, 255, 0.72); }\n.eg-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #5eead4; box-shadow: 0 0 0 4px rgba(94, 234, 212, 0.18); }\n.eg-hero-title { margin: 0; font-size: clamp(24px, 2.4vw, 34px); font-weight: 760; line-height: 1.22; letter-spacing: -0.035em; }\n.eg-hero-title em { font-style: normal; color: transparent; background: linear-gradient(90deg, #a5f3fc, #ddd6fe 72%); -webkit-background-clip: text; background-clip: text; }\n.eg-hero-text { max-width: 560px; margin: 0; font-size: 13.5px; line-height: 1.7; color: rgba(255, 255, 255, 0.76); }\n.eg-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 2px; }\n.eg-hero-primary { border-color: transparent !important; background: #fff !important; color: #2b2563 !important; box-shadow: 0 12px 30px -16px rgba(0, 0, 0, 0.55) !important; }\n.eg-hero-primary:hover { transform: translateY(-1px); }\n.eg-hero-link { display: inline-flex; align-items: center; gap: 4px; padding: 6px 2px; border-bottom: 1px solid transparent; color: rgba(255, 255, 255, 0.8); font-size: 12px; text-decoration: none; }\n.eg-hero-link:hover { color: #fff; border-color: rgba(255, 255, 255, 0.4); }\n.eg-hero-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 6px; font-size: 11px; color: rgba(255, 255, 255, 0.6); }\n.eg-hero-meta span { display: inline-flex; align-items: center; gap: 5px; }\n.eg-hero-visual { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; }\n.eg-hero-art { width: min(320px, 100%); height: auto; filter: drop-shadow(0 20px 40px rgba(10, 10, 35, 0.3)); }\n.eg-hero-nodes circle { transform-box: fill-box; transform-origin: center; animation: eg-node-breathe 5s ease-in-out infinite; }\n.eg-hero-nodes circle:nth-child(2n) { animation-delay: -1.4s; }\n.eg-hero-nodes circle:nth-child(3n) { animation-delay: -2.8s; }\n@keyframes eg-node-breathe { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.16); } }\n.eg-hero-lines path { stroke-dasharray: 4 6; animation: eg-dash 18s linear infinite; }\n@keyframes eg-dash { to { stroke-dashoffset: -100; } }\n\n.eg-section-title { font-size: 16px; font-weight: 720; letter-spacing: -0.02em; }\n\n.eg-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }\n.eg-step { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1px solid var(--eg-border); border-radius: 14px; background: color-mix(in srgb, var(--eg-layer) 70%, transparent); }\n.eg-step-icon { flex: none; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: var(--eg-brand-soft); color: var(--eg-brand); }\n.eg-step b { display: block; font-size: 12.5px; }\n.eg-step p { margin: 3px 0 0; font-size: 11.5px; line-height: 1.55; color: var(--eg-text-3); }\n\n.eg-course-card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  gap: 13px;\n  padding: 16px;\n  overflow: hidden;\n  border: 1px solid var(--eg-border);\n  border-radius: 18px;\n  background: color-mix(in srgb, var(--eg-layer) 78%, var(--eg-canvas));\n  box-shadow: var(--eg-shadow-sm);\n  cursor: pointer;\n  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;\n}\n.eg-course-card::after {\n  content: '';\n  position: absolute;\n  top: -60px;\n  right: -50px;\n  width: 140px;\n  height: 140px;\n  border-radius: 50%;\n  background: radial-gradient(circle, color-mix(in srgb, var(--eg-brand) 13%, transparent), transparent 70%);\n  opacity: 0;\n  transition: opacity 0.2s ease;\n  pointer-events: none;\n}\n.eg-course-card:hover {\n  transform: translateY(-3px);\n  border-color: color-mix(in srgb, var(--eg-brand) 30%, var(--eg-border));\n  box-shadow: 0 24px 50px -30px color-mix(in srgb, var(--eg-brand) 48%, transparent), var(--eg-shadow-sm);\n}\n.eg-course-card:hover::after { opacity: 1; }\n.eg-course-top { display: flex; align-items: flex-start; gap: 10px; }\n.eg-course-icon { flex: none; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: var(--eg-brand-soft); color: var(--eg-brand); }\n.eg-course-heading { flex: 1; min-width: 0; }\n.eg-course-name { font-size: 14.5px; font-weight: 680; letter-spacing: -0.015em; }\n.eg-course-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 3px; font-size: 11px; color: var(--eg-text-3); }\n.eg-course-delete { margin-top: -3px; opacity: 0; transition: opacity 0.15s ease; }\n.eg-course-card:hover .eg-course-delete { opacity: 1; }\n.eg-course-progress { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, var(--eg-text) 3.5%, transparent); }\n.eg-course-progress-text { display: flex; flex-direction: column; min-width: 0; }\n.eg-course-progress-text b { font-size: 17px; font-weight: 740; line-height: 1.1; letter-spacing: -0.03em; }\n.eg-course-progress-text span { margin-top: 2px; font-size: 10.5px; color: var(--eg-text-3); }\n.eg-course-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 18px; }\n.eg-course-go { display: inline-flex; align-items: center; gap: 2px; font-size: 11.5px; font-weight: 640; color: var(--eg-brand); opacity: 0.72; white-space: nowrap; transition: opacity 0.15s ease, transform 0.15s ease; }\n.eg-course-card:hover .eg-course-go { opacity: 1; transform: translateX(2px); }\n\n.eg-start-card { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; border: 1px dashed var(--eg-border-strong); border-radius: 18px; background: color-mix(in srgb, var(--eg-layer) 64%, transparent); }\n.eg-start-card-copy { display: flex; flex-direction: column; gap: 4px; }\n.eg-start-card-copy b { font-size: 14px; }\n.eg-start-card-copy span { font-size: 12px; color: var(--eg-text-3); }\n\n/* ================================================================ \u6982\u89C8 / \u4ECA\u65E5\u4EFB\u52A1 */\n\n.eg-today {\n  gap: 14px;\n  padding: 22px 24px;\n  overflow: hidden;\n  border-color: color-mix(in srgb, var(--eg-brand) 24%, var(--eg-border));\n  background:\n    radial-gradient(90% 140% at 100% 0%, color-mix(in srgb, var(--eg-accent) 10%, transparent), transparent 55%),\n    linear-gradient(120deg, color-mix(in srgb, var(--eg-brand) 9%, var(--eg-layer)), var(--eg-layer) 62%);\n}\n.eg-today::before {\n  content: '';\n  position: absolute;\n  right: -40px;\n  bottom: -80px;\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  background: radial-gradient(circle, color-mix(in srgb, var(--eg-brand) 14%, transparent), transparent 70%);\n  pointer-events: none;\n}\n.eg-today-main { position: relative; display: flex; align-items: flex-start; gap: 14px; }\n.eg-today-icon {\n  flex: none;\n  width: 46px;\n  height: 46px;\n  display: grid;\n  place-items: center;\n  border-radius: 14px;\n  color: #fff;\n  background: linear-gradient(135deg, var(--eg-brand), color-mix(in oklab, var(--eg-brand) 45%, var(--eg-accent)));\n  box-shadow: 0 12px 26px -14px color-mix(in srgb, var(--eg-brand) 68%, transparent);\n}\n.eg-today-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }\n.eg-eyebrow { font-size: 10px; font-weight: 650; letter-spacing: 0.14em; text-transform: uppercase; color: var(--eg-text-3); }\n.eg-today-title { font-size: 21px; font-weight: 740; line-height: 1.35; letter-spacing: -0.03em; }\n.eg-today-why { font-size: 13px; line-height: 1.6; color: var(--eg-text-2); }\n.eg-today-action { flex: none; align-self: center; }\n\n/* ================================================================ \u7AE0\u8282 / \u56FE\u8C31 */\n\n.eg-chapter-row { display: flex; align-items: center; gap: 12px; padding: 9px 2px; border-bottom: 1px dashed var(--eg-border); }\n.eg-chapter-row:last-child { border-bottom: 0; }\n.eg-chapter-title { flex: 1; min-width: 0; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.eg-chapter-title[data-level='2'] { padding-left: 14px; color: var(--eg-text-2); }\n.eg-chapter-title[data-level='3'] { padding-left: 28px; color: var(--eg-text-2); font-size: 12px; }\n.eg-chapter-bar { flex: none; width: 140px; }\n\n.eg-graph-shell {\n  position: relative;\n  height: clamp(460px, 62vh, 720px);\n  overflow: hidden;\n  border: 1px solid var(--eg-border);\n  border-radius: 20px;\n  background:\n    radial-gradient(120% 90% at 15% 0%, color-mix(in srgb, var(--eg-brand) 8%, transparent), transparent 60%),\n    radial-gradient(90% 80% at 100% 100%, color-mix(in srgb, var(--eg-accent) 7%, transparent), transparent 55%),\n    var(--eg-layer);\n  box-shadow: var(--eg-shadow-sm);\n}\n.eg-graph-svg { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }\n.eg-graph-svg[data-panning='true'] { cursor: grabbing; }\n.eg-graph-node { cursor: pointer; transition: opacity 0.18s ease; }\n.eg-graph-node[data-dim='true'] { opacity: 0.22; }\n.eg-graph-node text { paint-order: stroke; stroke: var(--eg-bg); stroke-width: 3px; stroke-linejoin: round; }\n.eg-graph-node circle { transition: opacity 0.12s ease; }\n.eg-graph-node:hover circle { stroke-width: 2.5; }\n.eg-node-in { animation: eg-node-in 0.46s cubic-bezier(0.22, 1, 0.36, 1) both; transform-box: fill-box; transform-origin: center; }\n@keyframes eg-node-in { from { opacity: 0; transform: scale(0.55); } to { opacity: 1; transform: scale(1); } }\n.eg-edge-in { animation: eg-edge-in 0.7s ease both; }\n@keyframes eg-edge-in { from { opacity: 0; } to { opacity: 1; } }\n.eg-node-halo { opacity: 0; pointer-events: none; transition: opacity 0.16s ease; }\n.eg-graph-node[data-focus='true'] .eg-node-halo { opacity: 1; }\n.eg-graph-hull { transition: opacity 0.22s ease; }\n.eg-graph-hull[data-dim='true'] { opacity: 0.25; }\n.eg-pulse { transform-box: fill-box; transform-origin: center; animation: eg-pulse 1.8s ease-out infinite; }\n@keyframes eg-pulse { 0% { transform: scale(0.85); opacity: 0.55; } 70% { transform: scale(1.9); opacity: 0; } 100% { opacity: 0; } }\n.eg-graph-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 3px 9px;\n  border: 1px solid var(--eg-border);\n  border-radius: 999px;\n  background: var(--eg-canvas);\n  color: var(--eg-text-2);\n  font-size: 11px;\n  cursor: pointer;\n  transition: all 0.14s ease;\n}\n.eg-graph-chip[data-active='true'] { border-color: var(--eg-brand); background: var(--eg-brand-soft); color: var(--eg-brand); }\n.eg-graph-chip i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: 0.8; }\n.eg-graph-tooltip {\n  position: absolute;\n  z-index: 5;\n  max-width: 260px;\n  padding: 9px 11px;\n  border: 1px solid var(--eg-border);\n  border-radius: 10px;\n  background: var(--eg-canvas);\n  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);\n  font-size: 12px;\n  line-height: 1.55;\n  pointer-events: none;\n}\n.eg-graph-tooltip b { display: block; margin-bottom: 3px; font-size: 12.5px; }\n.eg-graph-stats { display: flex; gap: 14px; font-size: 11px; color: var(--eg-text-3); }\n.eg-graph-tools { position: absolute; top: 10px; right: 10px; display: flex; gap: 6px; }\n.eg-graph-legend {\n  position: absolute;\n  left: 12px;\n  bottom: 12px;\n  display: flex;\n  gap: 12px;\n  padding: 6px 10px;\n  border: 1px solid var(--eg-border);\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--eg-canvas) 84%, transparent);\n  font-size: 11px;\n  color: var(--eg-text-3);\n  backdrop-filter: blur(8px);\n}\n\n/* ================================================================ \u8BB2\u89E3 / \u7EC3\u4E60 */\n\n.eg-concept-card {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 16px;\n  border: 1px solid var(--eg-border);\n  border-radius: var(--eg-radius);\n  background: color-mix(in srgb, var(--eg-layer) 76%, var(--eg-canvas));\n  box-shadow: var(--eg-shadow-sm);\n}\n.eg-concept-name { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }\n.eg-concept-def { font-size: 13px; line-height: 1.72; color: var(--eg-text-2); white-space: pre-wrap; }\n.eg-quote {\n  padding: 8px 10px;\n  border-left: 3px solid color-mix(in srgb, var(--eg-brand) 45%, var(--eg-border-strong));\n  border-radius: 0 var(--eg-radius-sm) var(--eg-radius-sm) 0;\n  background: color-mix(in srgb, var(--eg-brand) 5%, var(--eg-layer2));\n  color: var(--eg-text-2);\n  font-size: 12px;\n  line-height: 1.65;\n  white-space: pre-wrap;\n}\n.eg-quote-source { margin-top: 3px; font-size: 11px; color: var(--eg-text-3); }\n.eg-related { display: flex; flex-wrap: wrap; gap: 6px; }\n\n.eg-quiz-stem { font-size: 15px; font-weight: 560; line-height: 1.7; white-space: pre-wrap; }\n.eg-option {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  width: 100%;\n  padding: 11px 13px;\n  border: 1px solid var(--eg-border-strong);\n  border-radius: 11px;\n  background: var(--eg-canvas);\n  color: inherit;\n  font: inherit;\n  font-size: 13px;\n  line-height: 1.6;\n  text-align: left;\n  cursor: pointer;\n  transition: border-color 0.14s ease, background 0.14s ease, transform 0.14s ease;\n}\n.eg-option:hover:not(:disabled) { border-color: color-mix(in srgb, var(--eg-brand) 55%, var(--eg-border-strong)); background: color-mix(in srgb, var(--eg-brand) 1.5%, var(--eg-canvas)); transform: translateY(-1px); }\n.eg-option[data-state='correct'] { border-color: var(--eg-success); background: color-mix(in srgb, var(--eg-success) 9%, transparent); }\n.eg-option[data-state='wrong'] { border-color: var(--eg-error); background: color-mix(in srgb, var(--eg-error) 8%, transparent); }\n.eg-option-key {\n  flex: none;\n  width: 20px;\n  height: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 1px solid var(--eg-border-strong);\n  border-radius: 6px;\n  color: var(--eg-text-3);\n  font-size: 11px;\n  font-weight: 650;\n}\n.eg-feedback { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 12px; font-size: 13px; }\n.eg-feedback[data-tone='success'] { border: 1px solid color-mix(in srgb, var(--eg-success) 30%, transparent); background: color-mix(in srgb, var(--eg-success) 9%, transparent); }\n.eg-feedback[data-tone='error'] { border: 1px solid color-mix(in srgb, var(--eg-error) 28%, transparent); background: color-mix(in srgb, var(--eg-error) 8%, transparent); }\n.eg-feedback-title { display: flex; align-items: center; gap: 8px; font-weight: 650; }\n\n/* ================================================================ \u5F39\u7A97 / \u63D0\u793A */\n\n.eg-modal-mask {\n  position: fixed;\n  inset: 0;\n  z-index: 60;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background: rgba(20, 18, 45, 0.42);\n  backdrop-filter: blur(6px);\n  animation: eg-fade 0.14s ease;\n}\n@keyframes eg-fade { from { opacity: 0; } to { opacity: 1; } }\n.eg-modal {\n  display: flex;\n  flex-direction: column;\n  width: min(560px, 100%);\n  max-height: 86vh;\n  overflow: hidden;\n  border: 1px solid var(--eg-border);\n  border-radius: 20px;\n  background: var(--eg-canvas);\n  color: var(--eg-text);\n  box-shadow: var(--eg-shadow);\n  animation: eg-modal-in 0.2s cubic-bezier(0.22, 1, 0.36, 1);\n}\n@keyframes eg-modal-in { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: none; } }\n.eg-modal.wide { width: min(900px, 100%); }\n.eg-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--eg-border); }\n.eg-modal-title { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }\n.eg-modal-body { display: flex; flex-direction: column; gap: 14px; padding: 20px; overflow: auto; }\n.eg-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--eg-border); }\n\n.eg-toast {\n  position: fixed;\n  bottom: 26px;\n  left: 50%;\n  z-index: 80;\n  padding: 10px 18px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 999px;\n  background: rgba(24, 23, 40, 0.92);\n  color: #fff;\n  box-shadow: var(--eg-shadow);\n  font-size: 12px;\n  font-weight: 550;\n  transform: translateX(-50%);\n  backdrop-filter: blur(12px);\n  animation: eg-toast-in 0.18s ease;\n}\n@keyframes eg-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }\n\n/* ================================================================ \u9605\u8BFB\u5668 */\n\n.eg-reader-page { padding: 12px 0; border-bottom: 1px dashed var(--eg-border); }\n.eg-reader-page:last-child { border-bottom: 0; }\n.eg-reader-page-no { margin-bottom: 6px; font-size: 11px; letter-spacing: 0.4px; color: var(--eg-text-3); }\n.eg-reader-block { margin-bottom: 8px; font-size: 13px; line-height: 1.78; white-space: pre-wrap; }\n.eg-reader-block[data-kind='heading'] { margin-top: 12px; font-size: 14px; font-weight: 650; }\n\n/* ================================================================ \u53F3\u4FA7 AI \u5BFC\u5E08 */\n\n.eg-chat {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  border-left: 1px solid var(--eg-border);\n  background: linear-gradient(180deg, color-mix(in srgb, var(--eg-brand) 4%, var(--eg-layer)), var(--eg-layer) 200px);\n}\n.eg-app[data-chat='false'] .eg-chat { display: none; }\n.eg-chat-head {\n  flex: none;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: calc(var(--dsh-frame-top-clearance, 0px) + 14px) 14px 13px;\n  border-bottom: 1px solid var(--eg-border);\n}\n.eg-chat-avatar {\n  flex: none;\n  width: 34px;\n  height: 34px;\n  display: grid;\n  place-items: center;\n  border-radius: 11px;\n  color: #fff;\n  background: linear-gradient(135deg, #5b5bd6, #8b5cf6 55%, #14b8a6);\n  box-shadow: 0 10px 22px -12px rgba(91, 91, 214, 0.65);\n}\n.eg-chat-title { display: flex; flex-direction: column; min-width: 0; gap: 2px; }\n.eg-chat-title b { font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em; }\n.eg-chat-title span { display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--eg-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.eg-chat-actions { margin-left: auto; display: flex; gap: 1px; }\n.eg-chat-body { flex: 1; min-height: 0; padding: 10px; }\n.eg-chat-frame-wrap {\n  position: relative;\n  height: 100%;\n  overflow: hidden;\n  border: 1px solid var(--eg-border);\n  border-radius: 16px;\n  background: var(--eg-canvas);\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 0 0 1px color-mix(in srgb, var(--eg-text) 2%, transparent);\n}\n.eg-chat-frame { display: block; width: 100%; height: 100%; border: 0; background: var(--eg-canvas); }\n.eg-chat-frame-wrap::before {\n  content: '';\n  position: absolute;\n  z-index: 2;\n  top: 0;\n  right: 0;\n  left: 0;\n  height: 22px;\n  background: linear-gradient(180deg, var(--eg-canvas), transparent);\n  pointer-events: none;\n}\n.eg-chat-cover {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 14px;\n  padding: 22px;\n  background: color-mix(in srgb, var(--eg-canvas) 93%, var(--eg-layer));\n  transition: opacity 0.25s ease;\n}\n.eg-chat-skeleton { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; }\n.eg-chat-skel-row { display: flex; flex-direction: column; gap: 7px; }\n.eg-chat-skel-row.end { align-items: flex-end; }\n.eg-chat-skel-bubble { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 14px; background: color-mix(in srgb, var(--eg-text) 4%, transparent); }\n.eg-skel {\n  display: block;\n  height: 9px;\n  border-radius: 999px;\n  background: linear-gradient(90deg, color-mix(in srgb, var(--eg-text) 7%, transparent) 25%, color-mix(in srgb, var(--eg-text) 13%, transparent) 50%, color-mix(in srgb, var(--eg-text) 7%, transparent) 75%);\n  background-size: 360px 100%;\n  animation: eg-shimmer 1.5s linear infinite;\n}\n@keyframes eg-shimmer { from { background-position: -180px 0; } to { background-position: 180px 0; } }\n.eg-chat-slow { display: flex; flex-direction: column; align-items: center; gap: 6px; max-width: 300px; text-align: center; font-size: 11.5px; line-height: 1.55; color: var(--eg-text-3); }\n.eg-chat-slow b { font-size: 13px; color: var(--eg-text-2); }\n.eg-chat-foot {\n  flex: none;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  padding: 8px 16px calc(10px + env(safe-area-inset-bottom, 0px));\n  border-top: 1px solid var(--eg-border);\n  font-size: 10.5px;\n  color: var(--eg-text-3);\n}\n.eg-chat-sync { display: inline-flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.eg-chat-hint { white-space: nowrap; }\n\n/* ================================================================ \u542F\u52A8 / \u5176\u5B83 */\n\n.eg-boot { display: flex; align-items: center; justify-content: center; padding: 40px; }\n.eg-boot-card {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 10px;\n  padding: 28px 34px;\n  border: 1px solid var(--eg-border);\n  border-radius: 20px;\n  background: var(--eg-layer);\n  box-shadow: var(--eg-shadow);\n  animation: eg-rise 0.4s ease both;\n}\n.eg-boot-title { font-size: 15px; font-weight: 700; }\n.eg-boot-text { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--eg-text-3); }\n\n.eg-muted { font-size: 12px; color: var(--eg-text-3); }\n.eg-mono { font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); }\n.eg-kbd { padding: 1px 5px; border: 1px solid var(--eg-border-strong); border-radius: 4px; font-size: 11px; color: var(--eg-text-3); }\n.eg-divider { height: 1px; margin: 4px 0; background: var(--eg-border); }\n.eg-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 360px); gap: 16px; align-items: start; }\n.eg-scroll { overflow: auto; min-height: 0; }\n.eg-wrap { display: flex; flex-wrap: wrap; gap: 8px; }\n.eg-right { margin-left: auto; }\n.eg-center { display: flex; align-items: center; justify-content: center; }\n.eg-fill { flex: 1; min-width: 0; }\n.eg-nowrap { white-space: nowrap; }\n.eg-pointer { cursor: pointer; }\n.eg-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n/* ================================================================ \u81EA\u9002\u5E94\uFF08\u6309\u5B66\u4E60\u9762\u677F\u81EA\u8EAB\u5BBD\u5EA6\uFF0C\u800C\u4E0D\u662F\u6574\u4E2A\u7A97\u53E3\uFF09 */\n\n/* \u9762\u677F 1160px \u5DE6\u53F3\uFF08\u539F\u751F\u4FA7\u680F\u5C55\u5F00\u65F6\uFF09\uFF1A\u53F3\u680F\u6253\u5F00\u5C31\u6536\u7A84\u5DE6\u680F\uFF0C\u4E2D\u95F4\u8BA9\u51FA\u7A7A\u95F4 */\n@container (max-width: 1360px) {\n  .eg-app[data-chat='false'] .eg-shell { grid-template-columns: 236px minmax(0, 1fr); }\n  .eg-app[data-chat='true'] .eg-shell { grid-template-columns: 76px minmax(0, 1fr) clamp(330px, 30cqi, 390px); }\n  .eg-app[data-chat='true'] .eg-rail { align-items: center; padding-right: 9px; padding-left: 9px; }\n  .eg-app[data-chat='true'] .eg-brand { justify-content: center; padding-bottom: 14px; }\n  .eg-app[data-chat='true'] .eg-brand-text { display: none; }\n  .eg-app[data-chat='true'] .eg-rail-course { width: 100%; padding: 8px; gap: 8px; }\n  .eg-app[data-chat='true'] .eg-rail-course-text,\n  .eg-app[data-chat='true'] .eg-rail-course-head > .eg-icon-btn,\n  .eg-app[data-chat='true'] .eg-course-picker,\n  .eg-app[data-chat='true'] .eg-rail-due { display: none; }\n  .eg-app[data-chat='true'] .eg-rail-progress { justify-content: center; }\n  .eg-app[data-chat='true'] .eg-rail-progress-text { display: none; }\n  .eg-app[data-chat='true'] .eg-rail-empty { display: none; }\n  .eg-app[data-chat='true'] .eg-nav { width: 100%; align-items: center; }\n  .eg-app[data-chat='true'] .eg-nav-group,\n  .eg-app[data-chat='true'] .eg-nav-label,\n  .eg-app[data-chat='true'] .eg-nav-hint,\n  .eg-app[data-chat='true'] .eg-rail-note { display: none; }\n  .eg-app[data-chat='true'] .eg-nav-item { justify-content: center; width: 44px; height: 40px; margin: 0 auto; padding: 9px 0; }\n  .eg-app[data-chat='true'] .eg-nav-item[data-active='true']::before { left: -9px; }\n  .eg-app[data-chat='true'] .eg-nav-icon { width: 26px; height: 26px; }\n  .eg-app[data-chat='true'] .eg-rail-foot { width: 100%; align-items: center; }\n  .eg-app[data-chat='true'] .eg-rail-back { width: 44px; margin: 0 auto; }\n  .eg-app[data-chat='true'] .eg-nav-badge { position: absolute; top: 3px; right: 2px; }\n}\n\n/* \u9762\u677F\u4E0D\u8DB3 1040px\uFF1A\u53F3\u680F\u6539\u6210\u6D6E\u5C42\uFF0C\u6B63\u6587\u4E0D\u518D\u88AB\u6324 */\n@container (max-width: 1040px) {\n  .eg-app[data-chat='false'] .eg-shell { grid-template-columns: 236px minmax(0, 1fr); }\n  .eg-app[data-chat='true'] .eg-shell { grid-template-columns: 76px minmax(0, 1fr); }\n  .eg-app[data-chat='true'] .eg-rail { align-items: center; padding-right: 9px; padding-left: 9px; }\n  .eg-app[data-chat='true'] .eg-chat {\n    position: absolute;\n    top: calc(var(--dsh-frame-overlay-top, 20px) + 4px);\n    right: 12px;\n    bottom: 12px;\n    z-index: 50;\n    width: min(400px, calc(100% - 88px));\n    overflow: hidden;\n    border: 1px solid var(--eg-border);\n    border-radius: 20px;\n    background: var(--eg-layer);\n    box-shadow: var(--eg-shadow);\n  }\n  .eg-app[data-chat='true'] .eg-chat-head { padding-top: 12px; }\n}\n\n/* \u6781\u7A84\uFF1A\u5DE6\u4FA7\u680F\u53D8\u6210\u9876\u90E8\u6A2A\u6761 */\n@container (max-width: 760px) {\n  .eg-app[data-chat='true'] .eg-shell,\n  .eg-app[data-chat='false'] .eg-shell { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }\n  .eg-app[data-chat='true'] .eg-rail,\n  .eg-app[data-chat='false'] .eg-rail {\n    grid-column: 1;\n    grid-row: 1;\n    flex-direction: row;\n    align-items: center;\n    gap: 4px;\n    padding: 4px 8px;\n    border-right: 0;\n    border-bottom: 1px solid var(--eg-border);\n    overflow-x: auto;\n    overflow-y: hidden;\n  }\n  .eg-app .eg-brand, .eg-app .eg-rail-course, .eg-app .eg-rail-empty, .eg-app .eg-rail-foot { display: none; }\n  .eg-app[data-chat='true'] .eg-nav,\n  .eg-app[data-chat='false'] .eg-nav { flex-direction: row; align-items: center; gap: 2px; width: auto; }\n  .eg-app .eg-nav-group, .eg-app .eg-nav-hint { display: none; }\n  .eg-app[data-chat='true'] .eg-nav-item,\n  .eg-app[data-chat='false'] .eg-nav-item { justify-content: flex-start; width: auto; height: 36px; margin: 0; padding: 0 7px; gap: 6px; font-size: 11.5px; }\n  .eg-app[data-chat='true'] .eg-nav-icon,\n  .eg-app[data-chat='false'] .eg-nav-icon { width: 20px; height: 20px; }\n  .eg-app[data-chat='true'] .eg-nav-badge,\n  .eg-app[data-chat='false'] .eg-nav-badge { position: static; margin-left: 2px; }\n  .eg-app[data-chat='true'] .eg-nav-label,\n  .eg-app[data-chat='false'] .eg-nav-label { display: inline; font-size: 12px; }\n  .eg-app[data-chat='true'] .eg-nav-item[data-active='true']::before,\n  .eg-app[data-chat='false'] .eg-nav-item[data-active='true']::before { display: none; }\n  .eg-app .eg-stage { grid-column: 1; grid-row: 2; }\n  .eg-app .eg-topbar { padding-right: 14px; padding-left: 16px; }\n  .eg-settings-compact { display: inline-grid; }\n  .eg-app .eg-main { padding: 2px 14px 32px; }\n  .eg-app[data-chat='true'] .eg-chat {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    width: auto;\n    border: 0;\n    border-radius: 0;\n    box-shadow: none;\n  }\n  .eg-app .eg-chat-foot { padding-bottom: 10px; }\n  .eg-app .eg-chat-hint { display: none; }\n}\n\n/* \u6B63\u6587\u5185\u90E8\u6309\u81EA\u5DF1\u7684\u5BBD\u5EA6\u91CD\u6392 */\n@container (max-width: 820px) {\n  .eg-split { grid-template-columns: minmax(0, 1fr); }\n}\n@container (max-width: 860px) {\n  .eg-hero { grid-template-columns: 1fr; padding: 26px 24px; }\n  .eg-hero-visual { display: none; }\n}\n@container (max-width: 780px) {\n  .eg-steps { grid-template-columns: 1fr; }\n}\n@container (max-width: 620px) {\n  .eg-grid.cols-2, .eg-grid.cols-3, .eg-grid.cols-4 { grid-template-columns: 1fr; }\n  .eg-today-main { flex-wrap: wrap; }\n  .eg-today-action { width: 100%; }\n  .eg-start-card { flex-direction: column; align-items: flex-start; }\n}\n\n/* \u9876\u680F\u5728\u7A84\u9762\u677F\u9690\u85CF\u6B21\u8981\u6587\u6848 */\n@container (max-width: 900px) {\n  .eg-crumb-root, .eg-crumb-root + .eg-crumb-sep { display: none; }\n  .eg-hide-sm { display: none; }\n}\n";

// src/client/api.ts
var API = "/plugins/edugraph-learning/api";
var ApiError = class extends Error {
  status;
  code;
  constructor(message, status = 500, code = "error") {
    super(message);
    this.status = status;
    this.code = code;
  }
};
async function request(path, init) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers ?? {} }
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok || payload?.ok === false) {
    throw new ApiError(payload?.error ?? `\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09`, response.status, payload?.code ?? "http-error");
  }
  return payload;
}
function figureUrl(courseId, documentId, pageNo) {
  return `${API}/courses/${courseId}/documents/${documentId}/pages/${pageNo}/image`;
}
function mediaUrl(courseId, documentId, index) {
  return `${API}/courses/${courseId}/documents/${documentId}/media/${index}`;
}
var api = {
  health: () => request("/health"),
  listCourses: () => request("/courses"),
  createCourse: (body) => request("/courses", { method: "POST", body: JSON.stringify(body) }),
  getCourse: (id) => request(`/courses/${id}`),
  updateCourse: (id, body) => request(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: "DELETE" }),
  overview: (id) => request(`/courses/${id}/overview`),
  graph: (id) => request(`/courses/${id}/graph`),
  documents: (id) => request(`/courses/${id}/documents`),
  uploadDocument: async (id, file) => {
    const response = await fetch(`${API}/courses/${id}/documents?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok === false) throw new ApiError(payload?.error ?? "\u4E0A\u4F20\u5931\u8D25", response.status);
    return payload;
  },
  deleteDocument: (id, docId) => request(`/courses/${id}/documents/${docId}`, { method: "DELETE" }),
  documentMedia: (id, docId) => request(`/courses/${id}/documents/${docId}/media`),
  documentPages: (id, docId, from, count = 2) => request(`/courses/${id}/documents/${docId}/pages?from=${from}&count=${count}`),
  analyze: (id) => request(`/courses/${id}/analyze`, { method: "POST", body: "{}" }),
  plan: (id) => request(`/courses/${id}/plan`),
  generatePlan: (id, body) => request(`/courses/${id}/plan/generate`, { method: "POST", body: JSON.stringify(body) }),
  updateTask: (id, taskId, body) => request(`/courses/${id}/plan/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(body) }),
  lesson: (id, taskId) => request(`/courses/${id}/lesson${taskId ? `?taskId=${encodeURIComponent(taskId)}` : ""}`),
  createQuiz: (id, body) => request(`/courses/${id}/quiz`, { method: "POST", body: JSON.stringify(body) }),
  answer: (id, body) => request(`/courses/${id}/quiz/answer`, { method: "POST", body: JSON.stringify(body) }),
  mistakes: (id) => request(`/courses/${id}/mistakes`),
  reviews: (id) => request(`/courses/${id}/reviews`),
  gradeReview: (id, conceptId, rating) => request(`/courses/${id}/reviews/${conceptId}/grade`, { method: "POST", body: JSON.stringify({ rating }) }),
  search: (id, q, limit = 12) => request(`/courses/${id}/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  event: (id, body) => request(`/courses/${id}/events`, { method: "POST", body: JSON.stringify(body) }),
  getState: () => request("/state"),
  saveState: (patch) => request("/state", { method: "PUT", body: JSON.stringify(patch) }),
  getProfile: () => request("/profile"),
  saveProfile: (patch) => request("/profile", { method: "PUT", body: JSON.stringify(patch) })
};
function formatDue(due) {
  if (!due) return "\u672A\u5B89\u6392";
  const raw = due - Date.now();
  if (raw <= 0 && raw > -36e5) return "\u73B0\u5728";
  const minutes = Math.round(raw / 6e4);
  if (raw > 0 && minutes < 60) return `${minutes} \u5206\u949F\u540E`;
  const diff = Math.round(raw / 864e5);
  if (diff < -1) return `\u903E\u671F ${Math.abs(diff)} \u5929`;
  if (diff === -1) return "\u903E\u671F 1 \u5929";
  if (diff === 0) return "\u4ECA\u5929";
  if (diff === 1) return "\u660E\u5929";
  return `${diff} \u5929\u540E`;
}
function masteryLabel(level) {
  switch (level) {
    case "mastered":
      return { text: "\u5DF2\u638C\u63E1", tone: "success" };
    case "familiar":
      return { text: "\u719F\u6089", tone: "business" };
    case "learning":
      return { text: "\u5B66\u4E60\u4E2D", tone: "warn" };
    default:
      return { text: "\u8584\u5F31", tone: "error" };
  }
}
function formatDate(value) {
  if (!value) return "\u2014";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getMonth() + 1}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// src/client/ui.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var PATHS = {
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Zm0 0V20",
  layers: "M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  graph: "M6 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 21.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 19h-3a3 3 0 0 1-3-3V8m0 0 3 3m-3-3L9 11",
  quiz: "M9 9V4.5h6V9h4.5v6H15v4.5H9V15H4.5V9H9Zm0 0h6v6H9V9Z",
  flag: "M5 21V4h9l-1 3h7l-2 5 2 5h-7l-1-3H5",
  repeat: "M4 9a5 5 0 0 1 5-5h8m0 0-3-3m3 3-3 3M20 15a5 5 0 0 1-5 5H7m0 0 3 3m-3-3 3-3",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5c0-.6-.05-1.2-.14-1.76l2.02-1.57-2-3.46-2.38.96A8 8 0 0 0 15.1 4.4L14.7 2h-4l-.4 2.4a8 8 0 0 0-2.4 1.77l-2.38-.96-2 3.46 2.02 1.57A8.4 8.4 0 0 0 5.4 12c0 .6.05 1.2.14 1.76L3.52 15.33l2 3.46 2.38-.96a8 8 0 0 0 2.4 1.77l.4 2.4h4l.4-2.4a8 8 0 0 0 2.4-1.77l2.38.96 2-3.46-2.02-1.57c.09-.56.14-1.16.14-1.76Z",
  plus: "M12 5v14M5 12h14",
  upload: "M12 16V4m0 0L7 9m5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  trash: "M4 7h16M9 7V4h6v3m-7 0 1 13h6l1-13",
  close: "M6 6l12 12M18 6 6 18",
  chevron: "M9 6l6 6-6 6",
  spark: "M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3Z",
  check: "M4 12.5 9 18 20 6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3.5 2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5.2-1.8L21 21",
  "arrow-right": "M4 12h15m0 0-5-5m5 5-5 5",
  "arrow-left": "M20 12H5m0 0 5-5m-5 5 5 5",
  refresh: "M20 11a8 8 0 0 0-14-4.5L4 8m0-4v4h4M4 13a8 8 0 0 0 14 4.5L20 16m0 4v-4h-4",
  chat: "M20.5 11.6a8.2 8.2 0 0 1-11.9 7.3L4 20l1.2-4.3A8.2 8.2 0 1 1 20.5 11.6ZM8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01",
  panel: "M4 4h16v16H4V4Zm10 0v16"
};
function Icon({ name: name2, size = 16, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      "aria-hidden": "true",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: PATHS[name2] })
    }
  );
}
function Button({ children, variant = "default", size = "md", loading, className = "", ...rest }) {
  const cls = [
    "eg-btn",
    variant === "primary" ? "primary" : variant === "ghost" ? "ghost" : variant === "danger" ? "danger" : "",
    size === "sm" ? "sm" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: cls, disabled: rest.disabled || loading, ...rest, children: [
    loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "eg-spinner" }) : null,
    children
  ] });
}
function Badge({ children, tone }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "eg-badge", "data-tone": tone, children });
}
function Progress({ value, tone = "brand" }) {
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 100)));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-progress", "data-tone": tone, role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${pct}%` } }) });
}
function ProgressRing({ value, size = 42, stroke = 4, tone = "brand", label }) {
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 100)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      className: "eg-ring",
      "data-tone": tone,
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      role: "progressbar",
      "aria-valuenow": pct,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": label ?? "\u5B8C\u6210\u5EA6",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "eg-ring-track", cx: size / 2, cy: size / 2, r: radius, strokeWidth: stroke, fill: "none" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "circle",
          {
            className: "eg-ring-fill",
            cx: size / 2,
            cy: size / 2,
            r: radius,
            strokeWidth: stroke,
            fill: "none",
            strokeLinecap: "round",
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - pct / 100),
            transform: `rotate(-90 ${size / 2} ${size / 2})`
          }
        )
      ]
    }
  );
}
function BrandMark({ size = 40 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "eg-brand-mark", style: { width: size, height: size }, "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 32 32", width: size * 0.62, height: size * 0.62, fill: "none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M7 10.5 16 6l9 4.5v11L16 26l-9-4.5v-11Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round", opacity: ".55" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M7 10.5 16 15l9-4.5M16 15v11", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round", opacity: ".75" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "16", cy: "15", r: "2.6", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "7", cy: "10.5", r: "1.8", fill: "currentColor", opacity: ".9" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "25", cy: "10.5", r: "1.8", fill: "currentColor", opacity: ".9" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "16", cy: "26", r: "1.8", fill: "currentColor", opacity: ".9" })
  ] }) });
}
function Section({ title, hint, actions, children, className = "" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `eg-card ${className}`, children: [
    title || actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-card-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-card-title", children: title }),
        hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-card-hint", children: hint }) : null
      ] }),
      actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-row", children: actions }) : null
    ] }) : null,
    children
  ] });
}
function Stat({ value, label, sub }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-stat", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-stat-value", children: value }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-stat-label", children: label }),
    sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-stat-sub", children: sub }) : null
  ] });
}
function Field({ label, hint, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-field", children: [
    label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: label }) : null,
    children,
    hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-field-hint", children: hint }) : null
  ] });
}
function EmptyState({ title, text, action }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark", size: 38 }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-empty-title", children: title }),
    text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-empty-text", children: text }) : null,
    action
  ] });
}
function Loading({ text = "\u52A0\u8F7D\u4E2D\u2026" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-loading", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "eg-spinner" }),
    text
  ] });
}
function ErrorBox({ error }) {
  if (!error) return null;
  const message = error?.message ?? String(error);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-error-box", children: [
    "\u51FA\u9519\u4E86\uFF1A",
    message
  ] });
}
function Modal({ title, children, onClose, footer, wide }) {
  (0, import_react.useEffect)(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-modal-mask", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose?.();
  }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `eg-modal ${wide ? "wide" : ""}`, role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-modal-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-modal-title", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { variant: "ghost", size: "sm", onClick: onClose, "aria-label": "\u5173\u95ED", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "close", size: 14 }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-modal-body", children }),
    footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-modal-foot", children: footer }) : null
  ] }) });
}
function FigureModal({ src, title, hint, onClose, onPrev, onNext, busy }) {
  const [state, setState] = (0, import_react.useState)("loading");
  (0, import_react.useEffect)(() => {
    setState("loading");
  }, [src]);
  (0, import_react.useEffect)(() => {
    const onKey = (event) => {
      if (event.key === "ArrowLeft" && onPrev) {
        event.preventDefault();
        onPrev();
      }
      if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-modal-mask", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-modal wide", role: "dialog", "aria-modal": "true", "aria-label": title, style: { width: "min(1100px, 96vw)" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-modal-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-modal-title", children: title }),
        hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-card-hint", children: hint }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { variant: "ghost", size: "sm", onClick: onClose, "aria-label": "\u5173\u95ED", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "close", size: 14 }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-modal-body", style: { padding: 10, background: "var(--eg-layer2)", minHeight: 220, position: "relative" }, children: [
      state === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-loading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "eg-spinner" }),
        "\u6B63\u5728\u628A\u8FD9\u4E00\u9875\u753B\u6210\u56FE\u7247\u2026"
      ] }) : null,
      state === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-empty", style: { padding: 30 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-empty-title", children: "\u8FD9\u5F20\u56FE\u6CA1\u51FA\u6765" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-empty-text", children: [
          "\u53EF\u80FD\u662F\u7F3A canvas \u4F9D\u8D56\u6216\u6587\u4EF6\u592A\u5927\u3002\u5728\u63D2\u4EF6\u76EE\u5F55\u6267\u884C ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "npm install canvas" }),
          " \u540E\u91CD\u542F DSH \u518D\u8BD5\u3002"
        ] })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src,
          alt: title,
          hidden: state !== "ready",
          onLoad: () => setState("ready"),
          onError: () => setState("error"),
          style: { width: "100%", height: "auto", borderRadius: 8, background: "#fff" }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-modal-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "eg-muted", style: { marginRight: "auto" }, children: [
        onPrev || onNext ? "\u2190 \u2192 \u7FFB\u9875 \xB7 " : "",
        "\u770B\u4E0D\u6E05\u53EF\u4EE5\u53F3\u952E\u56FE\u7247\u53E6\u5B58"
      ] }),
      onPrev ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { size: "sm", onClick: onPrev, disabled: busy, children: "\u4E0A\u4E00\u9875" }) : null,
      onNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { size: "sm", onClick: onNext, disabled: busy, children: "\u4E0B\u4E00\u9875" }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { onClick: onClose, children: "\u5173\u95ED" })
    ] })
  ] }) });
}
function useResource(loader, deps) {
  const [data, setData] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const depsKey = JSON.stringify(deps);
  const loaderRef = (0, import_react.useRef)(loader);
  loaderRef.current = loader;
  const load = (0, import_react.useCallback)(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const value = await loaderRef.current();
      setData(value);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    void load();
  }, [depsKey, load]);
  return { data, error, loading, reload: load };
}
function useFileDrop(onFiles, enabled = true) {
  const [dragging, setDragging] = (0, import_react.useState)(false);
  const handlers = (0, import_react.useMemo)(() => ({
    onDragOver: (event) => {
      if (!enabled) return;
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event) => {
      if (!enabled) return;
      event.preventDefault();
      setDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length) onFiles(files);
    }
  }), [enabled, onFiles]);
  return { dragging, handlers };
}

// src/client/views/Library.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function LibraryView({ catalog, onOpen, onChanged, notify }) {
  const [creating, setCreating] = (0, import_react2.useState)(false);
  const [pendingDelete, setPendingDelete] = (0, import_react2.useState)(null);
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [form, setForm] = (0, import_react2.useState)({ name: "", subject: "", goal: "", examDate: "", dailyMinutes: 45 });
  const create = async () => {
    if (!form.name.trim()) {
      notify("\u8BF7\u586B\u5199\u8BFE\u7A0B\u540D\u79F0");
      return;
    }
    setBusy(true);
    try {
      const created = await api.createCourse({ name: form.name.trim(), subject: form.subject.trim(), goal: form.goal.trim() });
      if (form.examDate) await api.updateCourse(created.course.id, { examDate: form.examDate });
      if (Number(form.dailyMinutes)) await api.updateCourse(created.course.id, { dailyMinutes: Number(form.dailyMinutes) });
      setCreating(false);
      setForm({ name: "", subject: "", goal: "", examDate: "", dailyMinutes: 45 });
      notify("\u8BFE\u7A0B\u5EFA\u597D\u4E86\uFF0C\u4F20\u8D44\u6599\u5C31\u80FD\u5F00\u59CB");
      onChanged();
      onOpen(created.course.id);
    } catch (error) {
      notify(error?.message ?? "\u521B\u5EFA\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await api.deleteCourse(pendingDelete.id);
      notify("\u8BFE\u7A0B\u5DF2\u5220\u9664");
      setPendingDelete(null);
      onChanged();
    } catch (error) {
      notify(error?.message ?? "\u5220\u9664\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-grid", style: { gap: 18 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "eg-hero", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-hero-copy", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-hero-eyebrow", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "eg-hero-dot" }),
          "EduGraph \xB7 AI \u5B66\u4E60\u6A21\u5F0F"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h1", { className: "eg-hero-title", children: [
          "\u628A\u8BFE\u4EF6\u53D8\u6210",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("br", {}),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("em", { children: "\u4E00\u6761\u8D70\u5F97\u5B8C\u7684\u5B66\u4E60\u8DEF\u5F84" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "eg-hero-text", children: "\u4F20\u4E00\u4EFD\u8D44\u6599\uFF0C\u81EA\u52A8\u62C6\u51FA\u7AE0\u8282\u548C\u77E5\u8BC6\u70B9\uFF0C\u518D\u6309\u8003\u8BD5\u65E5\u671F\u6392\u597D\u8BB2\u89E3\u3001\u7EC3\u4E60\u548C\u590D\u4E60\u3002\u53F3\u4FA7 AI \u5BFC\u5E08\u968F\u65F6\u80FD\u95EE\uFF0C\u4E0D\u7528\u79BB\u5F00\u5B66\u4E60\u754C\u9762\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-hero-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "eg-btn eg-hero-primary", onClick: () => setCreating(true), children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "plus", size: 15 }),
            "\u65B0\u5EFA\u8BFE\u7A0B"
          ] }),
          catalog.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("a", { className: "eg-hero-link", href: "#eg-course-grid", onClick: (event) => {
            event.preventDefault();
            document.getElementById("eg-course-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, children: [
            "\u770B\u770B\u6211\u7684\u8BFE\u7A0B ",
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "chevron", size: 13 })
          ] }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-hero-meta", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "upload", size: 13 }),
            "PDF / Word / PPT / \u56FE\u7247"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "graph", size: 13 }),
            "\u77E5\u8BC6\u56FE\u8C31"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "repeat", size: 13 }),
            "\u95F4\u9694\u590D\u4E60"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "eg-hero-visual", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(HeroArt, {}) })
    ] }),
    catalog.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-steps", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-step", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "eg-step-icon", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "upload", size: 17 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: "\u628A\u8D44\u6599\u62D6\u8FDB\u6765" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "PDF\u3001Word\u3001PPT\u3001Markdown \u6216\u56FE\u7247\uFF0C\u4E00\u4EFD\u5C31\u591F\u5F00\u59CB\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-step", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "eg-step-icon", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "graph", size: 17 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: "\u81EA\u52A8\u62C6\u6210\u77E5\u8BC6\u70B9" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "\u7AE0\u8282\u3001\u5B9A\u4E49\u548C\u5148\u540E\u5173\u7CFB\u4E00\u8D77\u6574\u7406\u597D\uFF0C\u4E0D\u7528\u624B\u52A8\u8BB0\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-step", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "eg-step-icon", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "target", size: 17 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: "\u8DDF\u7740\u8BA1\u5212\u5B66" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "\u6309\u8003\u8BD5\u65E5\u671F\u548C\u6BCF\u5929\u65F6\u957F\u6392\u8BB2\u89E3\u3001\u7EC3\u4E60\u4E0E\u590D\u4E60\u3002" })
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "eg-section-title", children: "\u6211\u7684\u8BFE\u7A0B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "eg-muted", children: catalog.length ? catalog.length + " \u95E8\u8BFE \xB7 \u968F\u65F6\u63A5\u7740\u4E0A\u6B21\u7684\u8FDB\u5EA6" : "\u8FD8\u6CA1\u6709\u8BFE\u7A0B\uFF0C\u4ECE\u4E0A\u9762\u65B0\u5EFA\u4E00\u95E8" })
      ] }),
      catalog.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Button, { variant: "primary", onClick: () => setCreating(true), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "plus", size: 14 }),
        "\u65B0\u5EFA\u8BFE\u7A0B"
      ] }) : null
    ] }),
    catalog.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { id: "eg-course-grid", className: "eg-grid eg-course-grid", children: catalog.map((course) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        className: "eg-course-card",
        onClick: () => onOpen(course.id),
        role: "button",
        tabIndex: 0,
        onKeyDown: (event) => {
          if (event.key === "Enter") onOpen(course.id);
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-course-top", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "eg-course-icon", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "book", size: 17 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-course-heading", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "eg-course-name eg-ellipsis", title: course.name, children: course.name }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-course-meta", children: [
                course.subject ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: course.subject }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
                  course.documentCount,
                  " \u4EFD\u8D44\u6599"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
                  course.conceptCount,
                  " \u4E2A\u77E5\u8BC6\u70B9"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "eg-icon-btn sm eg-course-delete",
                title: "\u5220\u6389\u8BFE\u7A0B",
                onClick: (event) => {
                  event.stopPropagation();
                  setPendingDelete(course);
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "trash", size: 13 })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-course-progress", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ProgressRing, { value: (course.progress ?? 0) / 100, size: 46, stroke: 5, label: course.name + " \u7684\u5B8C\u6210\u5EA6" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-course-progress-text", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("b", { children: [
                course.progress ?? 0,
                "%"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
                "\u8BA1\u5212\u5B8C\u6210 \xB7 \u590D\u4E60\u7A33\u56FA ",
                course.masteredCount ?? 0,
                "/",
                course.conceptCount ?? 0
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-course-foot", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "eg-muted", children: [
              course.lastStudiedAt ? "\u4E0A\u6B21\u5B66\u5230 " + formatDate(course.lastStudiedAt).split(" ")[0] : "\u8FD8\u6CA1\u5F00\u59CB",
              course.examDate ? " \xB7 \u8003\u8BD5 " + course.examDate.slice(5) : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "eg-course-go", children: [
              "\u7EE7\u7EED\u5B66\u4E60 ",
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "chevron", size: 13 })
            ] })
          ] })
        ]
      },
      course.id
    )) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-start-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-start-card-copy", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: "\u7B2C\u4E00\u95E8\u8BFE\uFF0C\u4ECE\u4E00\u4EFD\u8D44\u6599\u5F00\u59CB" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u5EFA\u597D\u8BFE\u7A0B\u540E\u628A PDF\u3001Word\u3001PPT \u6216 Markdown \u62D6\u5230\u300C\u8D44\u6599\u300D\u9875\uFF0C\u5269\u4E0B\u4EA4\u7ED9 EduGraph\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Button, { variant: "primary", onClick: () => setCreating(true), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "plus", size: 14 }),
        "\u521B\u5EFA\u7B2C\u4E00\u95E8\u8BFE\u7A0B"
      ] })
    ] }),
    creating ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      Modal,
      {
        title: "\u65B0\u5EFA\u8BFE\u7A0B",
        onClose: () => setCreating(false),
        footer: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { onClick: () => setCreating(false), children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { variant: "primary", loading: busy, onClick: create, children: "\u521B\u5EFA" })
        ] }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: "\u8BFE\u7A0B\u540D\u79F0", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              className: "eg-input",
              value: form.name,
              autoFocus: true,
              placeholder: "\u4F8B\u5982\uFF1A\u6A21\u62DF\u7535\u5B50\u6280\u672F",
              onChange: (event) => setForm({ ...form, name: event.target.value }),
              onKeyDown: (event) => {
                if (event.key === "Enter") void create();
              }
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eg-grid cols-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: "\u5B66\u79D1\uFF08\u53EF\u9009\uFF09", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                className: "eg-input",
                value: form.subject,
                placeholder: "\u7535\u5B50\u5DE5\u7A0B / \u6570\u636E\u7ED3\u6784 / \u82F1\u8BED\u2026",
                onChange: (event) => setForm({ ...form, subject: event.target.value })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: "\u8003\u8BD5\u6216\u622A\u6B62\u65E5\u671F\uFF08\u53EF\u9009\uFF09", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                className: "eg-input",
                type: "date",
                value: form.examDate,
                onChange: (event) => setForm({ ...form, examDate: event.target.value })
              }
            ) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: "\u5B66\u4E60\u76EE\u6807\uFF08\u53EF\u9009\uFF09", hint: "\u4F8B\u5982\uFF1A\u4E24\u5468\u5185\u638C\u63E1\u4E8C\u6781\u7BA1\u4E0E\u4E09\u6781\u7BA1\u7535\u8DEF\u5206\u6790\uFF0C\u80FD\u72EC\u7ACB\u505A\u9898\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "textarea",
            {
              className: "eg-textarea",
              style: { minHeight: 64 },
              value: form.goal,
              onChange: (event) => setForm({ ...form, goal: event.target.value })
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: "\u6BCF\u5929\u53EF\u5B66\u4E60\u65F6\u95F4\uFF08\u5206\u949F\uFF09", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              className: "eg-input",
              type: "number",
              min: 10,
              max: 480,
              value: form.dailyMinutes,
              onChange: (event) => setForm({ ...form, dailyMinutes: Number(event.target.value) })
            }
          ) })
        ]
      }
    ) : null,
    pendingDelete ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      Modal,
      {
        title: "\u5220\u6389\u8BFE\u7A0B",
        onClose: () => setPendingDelete(null),
        footer: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { onClick: () => setPendingDelete(null), children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { variant: "danger", loading: busy, onClick: remove, children: "\u786E\u8BA4\u5220\u9664" })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          "\u5220\u6389\u300C",
          pendingDelete.name,
          "\u300D\u4F1A\u628A\u8FD9\u4E2A\u8BFE\u7684\u7AE0\u8282\u3001\u77E5\u8BC6\u70B9\u3001\u8BA1\u5212\u548C\u7B54\u9898\u8BB0\u5F55\u4E00\u8D77\u6E05\u6389\uFF0C\u5220\u4E86\u627E\u4E0D\u56DE\u6765\u3002"
        ] })
      }
    ) : null
  ] });
}
function HeroArt() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { className: "eg-hero-art", viewBox: "0 0 320 240", fill: "none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: "eg-hero-line", x1: "0", y1: "0", x2: "1", y2: "1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: ".75" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "1", stopColor: "#ffffff", stopOpacity: ".12" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: "eg-hero-glow", cx: "50%", cy: "50%", r: "50%", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: ".5" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "1", stopColor: "#ffffff", stopOpacity: "0" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "214", cy: "112", r: "98", fill: "url(#eg-hero-glow)", opacity: ".5" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { className: "eg-hero-lines", stroke: "url(#eg-hero-line)", strokeWidth: "1.2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M72 158 126 102 192 132 254 70" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M126 102 118 42M126 102 56 88M192 132 234 168M192 132 198 194M254 70 288 124" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { className: "eg-hero-nodes", fill: "#ffffff", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "72", cy: "158", r: "5", opacity: ".85" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "126", cy: "102", r: "8" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "192", cy: "132", r: "6" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "254", cy: "70", r: "4" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "118", cy: "42", r: "3.5", opacity: ".65" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "56", cy: "88", r: "3", opacity: ".6" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "234", cy: "168", r: "3.5", opacity: ".7" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "198", cy: "194", r: "3", opacity: ".55" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "288", cy: "124", r: "2.5", opacity: ".5" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { className: "eg-hero-labels", fill: "#ffffff", fontSize: "9", opacity: ".85", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: "138", y: "96", children: "\u6982\u5FF5" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: "202", y: "152", children: "\u5173\u7CFB" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: "82", y: "178", children: "\u638C\u63E1" })
    ] })
  ] });
}

// src/client/views/Study.tsx
var import_react3 = require("react");

// src/client/tutor.ts
var sender = null;
var nextId = 0;
function setTutorSender(next) {
  sender = next;
  return () => {
    if (sender === next) sender = null;
  };
}
function askTutor(text, label) {
  const value = String(text ?? "").trim();
  if (!value || !sender) return false;
  return sender(value.slice(0, 4e3), label);
}
function newAskId() {
  nextId += 1;
  return nextId;
}
function brief(text, max = 320) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  return value.length > max ? value.slice(0, max) + "\u2026" : value;
}
function clause(text, max = 320) {
  return brief(text, max).replace(/[。．.；;，,]+$/u, "");
}
function conceptAsk(name2, definition) {
  return `\u6211\u5728\u5B66\u300C${name2}\u300D\u3002${definition ? `\u8D44\u6599\u91CC\u7684\u5B9A\u4E49\u662F\uFF1A${clause(definition)}\u3002` : ""}
\u8BF7\u7528\u66F4\u76F4\u767D\u7684\u8BDD\u89E3\u91CA\u5B83\uFF0C\u5E76\u4E3E\u4E00\u4E2A\u5BB9\u6613\u51FA\u9519\u7684\u4F8B\u5B50\u3002`;
}
function recallAsk(names, prompt) {
  return `\u6211\u5728\u56DE\u5FC6\u8FD9\u7EC4\u77E5\u8BC6\u70B9\uFF1A${names.join("\u3001")}\u3002${prompt ? `\u56DE\u5FC6\u9898\uFF1A${clause(prompt, 500)}\u3002` : ""}
\u8BF7\u5148\u522B\u76F4\u63A5\u7ED9\u7B54\u6848\uFF0C\u7528 1-2 \u4E2A\u95EE\u9898\u5F15\u5BFC\u6211\u81EA\u5DF1\u60F3\u51FA\u6765\u3002`;
}
function mistakeAsk(question, myAnswer, expected) {
  return `\u6211\u521A\u505A\u9519\u4E86\u4E00\u9053\u9898\u3002
\u9898\u76EE\uFF1A${brief(question.stem, 600)}
\u6211\u7684\u7B54\u6848\uFF1A${brief(myAnswer, 320) || "\uFF08\u7A7A\uFF09"}
\u6B63\u786E\u7B54\u6848\uFF1A${brief(expected, 320) || "\uFF08\u9898\u76EE\u6CA1\u7ED9\u51FA\uFF09"}
\u8BF7\u89E3\u91CA\u6211\u9519\u5728\u54EA\uFF0C\u5E76\u7ED9\u6211\u4E00\u4E2A\u8BB0\u4F4F\u5B83\u7684\u529E\u6CD5\u3002`;
}
function groupAsk(name2, definition, tags) {
  return `\u6211\u5728\u300C${name2}\u300D\u4E0A\u53CD\u590D\u51FA\u9519\u3002${definition ? `\u8D44\u6599\u91CC\u7684\u5B9A\u4E49\u662F\uFF1A${clause(definition)}\u3002` : ""}
\u5E38\u89C1\u9519\u56E0\uFF1A${tags?.length ? tags.join("\u3001") : "\u8FD8\u6CA1\u5F52\u7C7B"}\u3002\u8BF7\u5E2E\u6211\u5206\u6E05\u5BB9\u6613\u6DF7\u6DC6\u7684\u5730\u65B9\uFF0C\u518D\u51FA 2 \u9053\u5C0F\u9898\u8003\u6211\u3002`;
}
function graphAsk(name2, definition, related) {
  return `\u6211\u5728\u77E5\u8BC6\u56FE\u8C31\u91CC\u770B\u300C${name2}\u300D\u3002${definition ? `\u8D44\u6599\u91CC\u7684\u5B9A\u4E49\u662F\uFF1A${clause(definition)}\u3002` : ""}
${related?.length ? `\u548C\u5B83\u76F8\u5173\u6216\u524D\u7F6E\u7684\u77E5\u8BC6\u70B9\uFF1A${related.slice(0, 6).join("\u3001")}\u3002` : ""}
\u8BF7\u544A\u8BC9\u6211\u5E94\u8BE5\u5148\u8865\u54EA\u4E2A\uFF0C\u518D\u7528\u4E00\u4E2A\u4F8B\u5B50\u628A\u5B83\u4EEC\u4E32\u8D77\u6765\u3002`;
}
function weakAsk(names) {
  return `\u6211\u6700\u8FD1\u6BD4\u8F83\u8584\u5F31\u7684\u77E5\u8BC6\u70B9\u662F\uFF1A${names.slice(0, 6).join("\u3001")}\u3002\u8BF7\u5148\u5E2E\u6211\u4E32\u8BB2\u5B83\u4EEC\u7684\u533A\u522B\uFF0C\u518D\u51FA 3 \u9053\u5C0F\u9898\u8003\u6211\u3002`;
}

// src/client/views/Study.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var TASK_TEXT = {
  lesson: "\u8BB2\u89E3",
  practice: "\u7EC3\u4E60",
  quiz: "\u5C0F\u6D4B",
  review: "\u590D\u4E60",
  recap: "\u603B\u590D\u4E60"
};
var TASK_TONE = {
  lesson: "brand",
  practice: "business",
  quiz: "warn",
  review: "success",
  recap: "error"
};
function OverviewView({ courseId, revision, onOpenView, notify }) {
  const { data, error, loading } = useResource(() => api.overview(courseId), [courseId, revision]);
  const overview = data;
  if (loading && !overview) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Loading, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ErrorBox, { error });
  if (!overview) return null;
  const { stats, chapters, nextTasks, weakConcepts, dueReviews, events, planProgress, profile } = overview;
  const hasDocs = stats.documents > 0;
  const hasPlan = planProgress.total > 0;
  const hasGoal = Boolean(profile.goal || profile.examDate);
  const accuracy = stats.accuracy === null ? "\u2014" : `${Math.round(stats.accuracy * 100)}%`;
  const action = !hasDocs ? { title: "\u5148\u4E0A\u4F20\u4E00\u4EFD\u8BFE\u7A0B\u8D44\u6599", why: "PDF\u3001Word\u3001PPT \u90FD\u884C\u3002\u7CFB\u7EDF\u4F1A\u62C6\u51FA\u7AE0\u8282\u548C\u77E5\u8BC6\u70B9\uFF0C\u4E4B\u540E\u624D\u6709\u5F97\u5B66\u3002", label: "\u53BB\u4E0A\u4F20", view: "documents", icon: "upload" } : !hasPlan ? { title: "\u751F\u6210\u4E00\u4EFD\u5B66\u4E60\u8BA1\u5212", why: "\u544A\u8BC9\u6211\u8003\u8BD5\u65E5\u671F\u548C\u6BCF\u5929\u80FD\u5B66\u591A\u4E45\uFF0C\u6211\u6309\u77E5\u8BC6\u70B9\u987A\u5E8F\u6392\u597D\u8BB2\u89E3\u3001\u7EC3\u4E60\u548C\u590D\u4E60\u3002", label: "\u53BB\u6392\u8BA1\u5212", view: "plan", icon: "target" } : dueReviews.length > 0 ? { title: `\u5148\u590D\u4E60 ${dueReviews.length} \u4E2A\u5FEB\u5FD8\u6389\u7684\u77E5\u8BC6\u70B9`, why: "\u8FD9\u51E0\u4E2A\u4ECA\u5929\u5230\u671F\u3002\u5148\u590D\u4E60\u518D\u5B66\u65B0\u7684\uFF0C\u8BB0\u5F97\u66F4\u7262\u3002", label: "\u5F00\u59CB\u590D\u4E60", view: "review", icon: "repeat" } : nextTasks.length ? { title: `\u63A5\u7740\u5B66\u300C${nextTasks[0].title}\u300D`, why: `\u5927\u7EA6 ${nextTasks[0].estimatedMinutes} \u5206\u949F\u3002\u5B66\u5B8C\u8FD9\u4E00\u7EC4\u5C31\u5B8C\u6210\u4ECA\u5929\u7684\u4EFB\u52A1\u4E86\u3002`, label: "\u5F00\u59CB\u5B66\u4E60", view: nextTasks[0].type === "practice" || nextTasks[0].type === "quiz" ? "quiz" : "lesson", icon: "spark" } : { title: "\u4ECA\u5929\u7684\u4EFB\u52A1\u90FD\u5B8C\u6210\u4E86", why: "\u60F3\u591A\u5B66\u4E00\u70B9\u53EF\u4EE5\u518D\u6765\u4E00\u7EC4\u7EC3\u4E60\uFF0C\u6216\u8005\u53BB\u56FE\u8C31\u770B\u770B\u54EA\u5757\u8FD8\u4E0D\u719F\u3002", label: "\u518D\u7EC3\u4E00\u7EC4", view: "quiz", icon: "check" };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "eg-card eg-today", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-today-main", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-today-icon", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: action.icon, size: 22 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-today-copy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-eyebrow", children: "\u73B0\u5728\u505A\u8FD9\u4E2A" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-today-title", children: action.title }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-today-why", children: action.why })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { variant: "primary", className: "eg-today-action", onClick: () => onOpenView(action.view), children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: action.icon, size: 15 }),
          action.label
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-wrap", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-badge", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "clock", size: 12 }),
          "\u4ECA\u5929\u5DF2\u7EC3 ",
          overview.today.attempts,
          " \u9898"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-badge", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "repeat", size: 12 }),
          stats.dueToday,
          " \u4E2A\u5F85\u590D\u4E60"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-badge", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "target", size: 12 }),
          "\u8BA1\u5212\u5B8C\u6210 ",
          planProgress.done,
          "/",
          planProgress.total || 0
        ] }),
        profile.examDate ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-badge", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "flag", size: 12 }),
          "\u8003\u8BD5 ",
          profile.examDate
        ] }) : null
      ] })
    ] }),
    !hasDocs || !hasGoal || !hasPlan ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { title: "\u4E09\u6B65\u5C31\u80FD\u5F00\u59CB", hint: "\u505A\u5B8C\u8FD9\u4E09\u4EF6\u4E8B\uFF0C\u5269\u4E0B\u7684\u4EA4\u7ED9\u7CFB\u7EDF\u5B89\u6392", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid cols-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        StepCard,
        {
          index: 1,
          done: hasDocs,
          title: "\u4E0A\u4F20\u8D44\u6599",
          text: hasDocs ? `\u5DF2\u4E0A\u4F20 ${stats.documents} \u4EFD` : "\u8BFE\u7A0B PDF\u3001\u8BFE\u4EF6\u6216\u7B14\u8BB0\uFF0C\u4E00\u4EFD\u5C31\u591F\u5F00\u59CB",
          action: hasDocs ? null : { label: "\u53BB\u4E0A\u4F20", onClick: () => onOpenView("documents") }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        StepCard,
        {
          index: 2,
          done: hasGoal,
          title: "\u8BF4\u4E00\u4E0B\u76EE\u6807",
          text: hasGoal ? `\u76EE\u6807\uFF1A${profile.goal || "\u5DF2\u8BB0\u5F55"}` : "\u8003\u8BD5\u65F6\u95F4\u3001\u6BCF\u5929\u80FD\u5B66\u591A\u4E45\uFF0C\u51B3\u5B9A\u8BA1\u5212\u5F3A\u5EA6",
          action: hasGoal ? null : { label: "\u53BB\u8BBE\u7F6E", onClick: () => onOpenView("settings") }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        StepCard,
        {
          index: 3,
          done: hasPlan,
          title: "\u751F\u6210\u8BA1\u5212",
          text: hasPlan ? `${planProgress.total} \u4E2A\u4EFB\u52A1\u5DF2\u6392\u597D` : "\u6309\u77E5\u8BC6\u70B9\u987A\u5E8F\u6392\u8BB2\u89E3\u3001\u7EC3\u4E60\u548C\u590D\u4E60",
          action: hasPlan ? null : { label: "\u53BB\u6392\u8BA1\u5212", onClick: () => onOpenView("plan") }
        }
      )
    ] }) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid eg-stat-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, { value: stats.concepts, label: "\u77E5\u8BC6\u70B9", sub: `${stats.chapters} \u4E2A\u7AE0\u8282` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, { value: stats.mastered, label: "\u5DF2\u7ECF\u638C\u63E1", sub: `\u534A\u719F ${stats.familiar} \xB7 \u8FD8\u751F ${stats.weak}` }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, { value: stats.dueToday, label: "\u4ECA\u5929\u8BE5\u590D\u4E60", sub: stats.dueToday > 0 ? "\u5148\u590D\u4E60\uFF0C\u4E8B\u534A\u529F\u500D" : "\u4ECA\u5929\u6CA1\u6709\u5230\u671F\u7684" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, { value: accuracy, label: "\u7B54\u9898\u6B63\u786E\u7387", sub: `\u5171\u7B54 ${stats.attempts} \u9898` })
    ] }),
    !hasDocs ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      EmptyState,
      {
        title: "\u8FD9\u95E8\u8BFE\u8FD8\u7A7A\u7740",
        text: "\u4E0A\u4F20\u4E00\u4EFD\u8D44\u6599\uFF0C\u6211\u5C31\u80FD\u628A\u7AE0\u8282\u3001\u77E5\u8BC6\u70B9\u548C\u5B83\u4EEC\u7684\u5148\u540E\u5173\u7CFB\u6574\u7406\u51FA\u6765\uFF0C\u518D\u5E2E\u4F60\u6392\u8BA1\u5212\u3002",
        action: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "primary", onClick: () => onOpenView("documents"), children: "\u4E0A\u4F20\u8D44\u6599" })
      }
    ) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-split", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          Section,
          {
            title: "\u63A5\u4E0B\u6765\u505A\u7684\u4E8B",
            hint: hasPlan ? `\u6574\u4F53\u5B8C\u6210 ${planProgress.done}/${planProgress.total}` : "\u8FD8\u6CA1\u6709\u8BA1\u5212",
            actions: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", onClick: () => onOpenView("plan"), children: "\u770B\u5168\u90E8" }),
            children: nextTasks.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-list", children: nextTasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                className: "eg-list-row",
                onClick: () => onOpenView(task.type === "review" ? "review" : task.type === "practice" || task.type === "quiz" ? "quiz" : "lesson"),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-dot", "data-tone": TASK_TONE[task.type] ?? "brand" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-main", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-title", children: task.title }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-sub", children: [
                      TASK_TEXT[task.type] ?? task.type,
                      " \xB7 \u7EA6 ",
                      task.estimatedMinutes,
                      " \u5206\u949F \xB7 \u6392\u5728 ",
                      task.dueDate
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-side", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "chevron", size: 14 }) })
                ]
              },
              task.id
            )) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-muted", children: "\u8FD8\u6CA1\u6392\u4EFB\u52A1\u3002" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "primary", onClick: () => onOpenView("plan"), children: "\u751F\u6210\u8BA1\u5212" })
            ] })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { title: "\u6BCF\u7AE0\u5B66\u5F97\u600E\u4E48\u6837", hint: "\u6761\u8D8A\u957F\uFF0C\u8FD9\u4E00\u7AE0\u8D8A\u719F", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          chapters.slice(0, 40).map((chapter) => {
            const conceptCount = chapter.conceptCount ?? 0;
            const mastery = chapter.mastery ?? 0;
            return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-chapter-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-chapter-title", "data-level": Math.min(3, chapter.level), title: chapter.title, children: chapter.title }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-muted eg-nowrap", children: [
                chapter.masteredCount ?? 0,
                "/",
                conceptCount
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-chapter-bar", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Progress, { value: mastery, tone: mastery >= 0.8 ? "success" : mastery >= 0.4 ? "warn" : "error" }) })
            ] }, chapter.id);
          }),
          chapters.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "\u8FD8\u6CA1\u6709\u7AE0\u8282" }) : null
        ] }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { title: "\u54EA\u91CC\u8FD8\u751F", hint: "\u6309\u719F\u7EC3\u5EA6\u4ECE\u4F4E\u5230\u9AD8", actions: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "eg-ask",
              disabled: !weakConcepts.length,
              onClick: () => askTutor(weakAsk(weakConcepts.slice(0, 6).map((concept) => concept.name)), "\u8584\u5F31\u77E5\u8BC6\u70B9"),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "chat", size: 13 }),
                "\u95EE\u5BFC\u5E08"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => onOpenView("graph"), children: "\u770B\u56FE\u8C31" })
        ] }), children: weakConcepts.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-wrap", children: weakConcepts.map((concept) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-badge", title: `\u719F\u7EC3\u5EA6 ${Math.round(concept.mastery * 100)}%`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-dot", "data-tone": concept.mastery >= 0.6 ? "warn" : "error" }),
          concept.name
        ] }, concept.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "\u76EE\u524D\u6CA1\u6709\u660E\u663E\u8584\u5F31\u7684\u5730\u65B9\uFF0C\u7EE7\u7EED\u7EC3\u5C31\u884C\u3002" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          Section,
          {
            title: "\u4ECA\u5929\u5230\u671F",
            hint: dueReviews.length ? "\u5FD8\u5F97\u5DEE\u4E0D\u591A\u4E86\uFF0C\u5148\u8FC7\u4E00\u904D" : "\u4ECA\u5929\u6CA1\u6709\u5230\u671F\u7684",
            actions: dueReviews.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", onClick: () => onOpenView("review"), children: "\u53BB\u590D\u4E60" }) : null,
            children: dueReviews.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-list", children: dueReviews.slice(0, 8).map((item) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-main", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-title", children: item.name }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-side eg-muted", children: formatDue(item.due) })
            ] }, item.conceptId)) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "\u505A\u5B8C\u7EC3\u4E60\u4F1A\u81EA\u52A8\u5B89\u6392\u4E0B\u6B21\u590D\u4E60\u65F6\u95F4\u3002" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { title: "\u6700\u8FD1\u5728\u505A\u4EC0\u4E48", children: events.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-list", children: events.slice(0, 8).map((event) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-list-row", style: { cursor: "default" }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-main", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-title", children: describeEvent(event) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-sub", children: formatDate(event.createdAt) })
        ] }) }, event.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "\u8FD8\u6CA1\u6709\u5B66\u4E60\u8BB0\u5F55\u3002" }) })
      ] })
    ] })
  ] });
}
function StepCard({ index, done, title, text, action }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: {
    border: "1px solid var(--eg-border)",
    borderRadius: "var(--eg-radius)",
    padding: "14px 16px",
    background: done ? "color-mix(in srgb, var(--eg-success) 7%, transparent)" : "var(--eg-bg)",
    display: "flex",
    flexDirection: "column",
    gap: 8
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row", style: { gap: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        background: done ? "var(--eg-success)" : "var(--eg-layer3)",
        color: done ? "#fff" : "var(--eg-text-2)"
      }, children: done ? "\u2713" : index }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontWeight: 620, fontSize: 13.5 }, children: title })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", style: { fontSize: 12 }, children: text }),
    action ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", onClick: action.onClick, style: { alignSelf: "flex-start" }, children: action.label }) : null
  ] });
}
function describeEvent(event) {
  const name2 = event.conceptName || "\u8BFE\u7A0B";
  switch (event.type) {
    case "answer":
      return `\u505A\u4E86\u300C${name2}\u300D\u7684\u9898`;
    case "review":
      return `\u590D\u4E60\u4E86\u300C${name2}\u300D`;
    case "explain":
      return `\u8BB2\u4E86\u300C${name2}\u300D`;
    case "recall":
      return `\u56DE\u5FC6\u4E86\u300C${name2}\u300D`;
    case "mistake":
      return `\u8BB0\u4E0B\u300C${name2}\u300D\u7684\u9519\u56E0`;
    default:
      return name2;
  }
}
var STATUS_TEXT = {
  parsing: "\u6B63\u5728\u8BFB",
  analyzing: "\u6B63\u5728\u6574\u7406",
  ready: "\u53EF\u4EE5\u7528",
  failed: "\u8BFB\u5931\u8D25\u4E86"
};
var STATUS_TONE = {
  parsing: "warn",
  analyzing: "business",
  ready: "success",
  failed: "error"
};
function DocumentsView({ courseId, revision, onChanged, notify }) {
  const { data, error, loading, reload } = useResource(() => api.documents(courseId), [courseId, revision]);
  const [uploading, setUploading] = (0, import_react3.useState)(false);
  const [reading, setReading] = (0, import_react3.useState)(null);
  const [galleryDoc, setGalleryDoc] = (0, import_react3.useState)(null);
  const [pendingDelete, setPendingDelete] = (0, import_react3.useState)(null);
  const [analyzing, setAnalyzing] = (0, import_react3.useState)(false);
  const inputRef = (0, import_react3.useRef)(null);
  const documents = data?.documents ?? [];
  const busy = documents.some((doc) => doc.status === "parsing" || doc.status === "analyzing");
  (0, import_react3.useEffect)(() => {
    if (!busy) return void 0;
    const timer = window.setInterval(() => {
      void reload(true);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [busy, reload]);
  const upload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > 80 * 1024 * 1024) {
          notify(`${file.name} \u592A\u5927\u4E86\uFF08\u8D85\u8FC7 80MB\uFF09\uFF0C\u6362\u4E2A\u5C0F\u4E00\u70B9\u7684`);
          continue;
        }
        await api.uploadDocument(courseId, file);
      }
      notify(`\u6536\u5230 ${files.length} \u4EFD\u8D44\u6599\uFF0C\u6B63\u5728\u540E\u53F0\u6574\u7406`);
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u4E0A\u4F20\u6CA1\u6210\u529F\uFF0C\u518D\u8BD5\u4E00\u6B21");
    } finally {
      setUploading(false);
    }
  };
  const drop = useFileDrop((files) => {
    void upload(files);
  }, !uploading);
  const reanalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await api.analyze(courseId);
      notify(`\u91CD\u65B0\u6574\u7406\u5B8C\u4E86\uFF1A${result.chapters ?? 0} \u4E2A\u7AE0\u8282\u3001${result.concepts ?? 0} \u4E2A\u77E5\u8BC6\u70B9`);
      onChanged();
    } catch (err) {
      notify(err?.message ?? "\u6574\u7406\u5931\u8D25");
    } finally {
      setAnalyzing(false);
    }
  };
  const remove = async () => {
    if (!pendingDelete) return;
    try {
      await api.deleteDocument(courseId, pendingDelete.id);
      notify("\u8D44\u6599\u5220\u6389\u4E86\uFF0C\u77E5\u8BC6\u70B9\u5DF2\u91CD\u65B0\u6574\u7406");
      setPendingDelete(null);
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u5220\u9664\u5931\u8D25");
    }
  };
  if (loading && !data) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Loading, {});
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 17, fontWeight: 650 }, children: "\u8BFE\u7A0B\u8D44\u6599" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "PDF\u3001Word\u3001PPT\u3001Excel\u3001Markdown\u3001TXT\u3001\u56FE\u7247\u90FD\u884C\u3002\u4E0A\u4F20\u540E\u4E0D\u7528\u7B49\uFF0C\u6574\u7406\u5B8C\u4F1A\u81EA\u5DF1\u51FA\u73B0\u5728\u8BE6\u60C5\u91CC\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { size: "sm", loading: analyzing, onClick: reanalyze, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "refresh", size: 13 }),
          "\u91CD\u65B0\u6574\u7406"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { size: "sm", variant: "primary", loading: uploading, onClick: () => inputRef.current?.click(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "upload", size: 13 }),
          "\u4E0A\u4F20\u8D44\u6599"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "input",
      {
        ref: inputRef,
        type: "file",
        multiple: true,
        hidden: true,
        accept: ".pdf,.docx,.pptx,.xlsx,.md,.markdown,.txt,.png,.jpg,.jpeg,.webp",
        onChange: (event) => {
          void upload(Array.from(event.target.files ?? []));
          event.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        ...drop.handlers,
        style: {
          border: `1.5px dashed ${drop.dragging ? "var(--eg-brand)" : "var(--eg-border-strong)"}`,
          borderRadius: "var(--eg-radius)",
          padding: "26px 18px",
          textAlign: "center",
          cursor: "pointer",
          background: drop.dragging ? "color-mix(in srgb, var(--eg-brand) 6%, transparent)" : "transparent",
          transition: "all 140ms ease"
        },
        onClick: () => inputRef.current?.click(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", style: { fontSize: 13 }, children: uploading ? "\u6B63\u5728\u4E0A\u4F20\u2026" : "\u628A\u6587\u4EF6\u62D6\u5230\u8FD9\u91CC\uFF0C\u6216\u70B9\u4E00\u4E0B\u9009\u6587\u4EF6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", style: { fontSize: 11, marginTop: 4 }, children: "\u652F\u6301\u4E00\u6B21\u9009\u591A\u4E2A\u3002\u5173\u6389\u9875\u9762\u4E5F\u4E0D\u5F71\u54CD\u540E\u53F0\u6574\u7406\u3002" })
        ]
      }
    ),
    error ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ErrorBox, { error }) : null,
    documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(EmptyState, { title: "\u8FD8\u6CA1\u6709\u8D44\u6599", text: "\u5148\u4F20\u4E00\u4EFD\uFF0C\u6211\u624D\u6709\u4E1C\u897F\u53EF\u6559\u3002" }) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-list", children: documents.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-dot", "data-tone": STATUS_TONE[doc.status] ?? "brand" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-main", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-title eg-ellipsis", title: doc.filename, children: doc.filename }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-sub", children: [
          doc.pages,
          " \u9875 \xB7 ",
          (doc.charCount / 1e3).toFixed(1),
          "k \u5B57",
          doc.error ? ` \xB7 ${doc.error}` : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-side", children: [
        doc.status === "parsing" || doc.status === "analyzing" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-spinner" }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: STATUS_TONE[doc.status], children: STATUS_TEXT[doc.status] ?? doc.status }),
        doc.status === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setReading(doc), children: "\u7FFB\u539F\u6587" }) : null,
        doc.status === "ready" && /\.(docx|pptx)$/i.test(doc.filename) ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setGalleryDoc(doc), children: "\u770B\u56FE\u7247" }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setPendingDelete(doc), "aria-label": "\u5220\u9664\u8D44\u6599", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "trash", size: 13 }) })
      ] })
    ] }, doc.id)) }),
    reading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReaderModal, { courseId, doc: reading, onClose: () => setReading(null) }) : null,
    galleryDoc ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MediaGalleryModal, { courseId, doc: galleryDoc, onClose: () => setGalleryDoc(null) }) : null,
    pendingDelete ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Modal,
      {
        title: "\u5220\u6389\u8FD9\u4EFD\u8D44\u6599\uFF1F",
        onClose: () => setPendingDelete(null),
        footer: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { onClick: () => setPendingDelete(null), children: "\u5148\u7559\u7740" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "danger", onClick: remove, children: "\u5220\u6389" })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          "\u5220\u6389\u300C",
          pendingDelete.filename,
          "\u300D\u4F1A\u4E00\u8D77\u6E05\u6389\u5B83\u7684\u6587\u5B57\u548C\u56FE\u7247\uFF0C\u77E5\u8BC6\u70B9\u4F1A\u91CD\u65B0\u6574\u7406\u3002\u5DF2\u7ECF\u505A\u8FC7\u7684\u9898\u548C\u590D\u4E60\u8BB0\u5F55\u4E0D\u4F1A\u4E22\u3002"
        ] })
      }
    ) : null
  ] });
}
function ReaderModal({ courseId, doc, onClose }) {
  const [page, setPage] = (0, import_react3.useState)(1);
  const [pages, setPages] = (0, import_react3.useState)([]);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [error, setError] = (0, import_react3.useState)(null);
  const [figurePage, setFigurePage] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    let cancelled = false;
    setLoading(true);
    api.documentPages(courseId, doc.id, page, 1).then((data) => {
      if (!cancelled) {
        setPages(data.pages);
        setError(null);
      }
    }).catch((err) => {
      if (!cancelled) setError(err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId, doc.id, page]);
  const showFigure = (pageNo) => setFigurePage(Math.max(1, Math.min(doc.pages || 1, pageNo)));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    Modal,
    {
      wide: true,
      title: doc.filename,
      onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", disabled: page <= 1, onClick: () => setPage((value) => Math.max(1, value - 1)), children: "\u4E0A\u4E00\u9875" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-muted", style: { alignSelf: "center" }, children: [
          page,
          " / ",
          doc.pages
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", disabled: page >= doc.pages, onClick: () => setPage((value) => Math.min(doc.pages, value + 1)), children: "\u4E0B\u4E00\u9875" })
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row", style: { marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { size: "sm", onClick: () => showFigure(page), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "layers", size: 13 }),
            "\u770B\u8FD9\u4E00\u9875\u7684\u56FE\uFF08\u7535\u8DEF\u56FE/\u6CE2\u5F62\uFF09"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-muted", style: { fontSize: 11 }, children: "\u6587\u5B57\u91CC\u770B\u4E0D\u5230\u7684\u56FE\uFF0C\u4ECE\u8FD9\u91CC\u770B" })
        ] }),
        loading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Loading, {}) : null,
        error ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ErrorBox, { error }) : null,
        pages.map((item) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-reader-page", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-reader-page-no", children: [
            "\u7B2C ",
            item.pageNo,
            " \u9875"
          ] }),
          (item.blocks ?? []).map((block) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-reader-block", "data-kind": block.kind, children: block.text }, block.id))
        ] }, item.pageNo)),
        !loading && !pages.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "\u8FD9\u4E00\u9875\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6587\u5B57\u3002" }) : null,
        figurePage ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          FigureModal,
          {
            src: figureUrl(courseId, doc.id, figurePage),
            title: `${doc.filename} \xB7 \u7B2C ${figurePage} \u9875`,
            hint: "PDF \u91CC\u7684\u7535\u8DEF\u56FE\u662F\u77E2\u91CF\u753B\u7684\uFF0C\u6240\u4EE5\u8FD9\u91CC\u628A\u6574\u9875\u6E32\u67D3\u6210\u56FE\u7247",
            onPrev: figurePage > 1 ? () => setFigurePage(figurePage - 1) : void 0,
            onNext: figurePage < doc.pages ? () => setFigurePage(figurePage + 1) : void 0,
            onClose: () => setFigurePage(null)
          }
        ) : null
      ]
    }
  );
}
function MediaGalleryModal({ courseId, doc, onClose }) {
  const [media, setMedia] = (0, import_react3.useState)(null);
  const [active, setActive] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => {
    let cancelled = false;
    api.documentMedia(courseId, doc.id).then((data) => {
      if (!cancelled) setMedia(data.media);
    }).catch(() => {
      if (!cancelled) setMedia([]);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId, doc.id]);
  if (!media) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Modal, { title: `${doc.filename} \xB7 \u56FE\u7247`, onClose, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Loading, {}) });
  if (!media.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Modal, { title: `${doc.filename} \xB7 \u56FE\u7247`, onClose, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: "\u8FD9\u4EFD\u8D44\u6599\u91CC\u6CA1\u6709\u5185\u5D4C\u56FE\u7247\u3002PDF \u7684\u8BDD\u7528\u300C\u7FFB\u539F\u6587 \u2192 \u770B\u8FD9\u4E00\u9875\u7684\u56FE\u300D\u3002" }) });
  }
  const current = media[Math.min(active, media.length - 1)];
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    FigureModal,
    {
      src: mediaUrl(courseId, doc.id, current.index),
      title: `${doc.filename} \xB7 ${current.name}`,
      hint: `\u7B2C ${active + 1} / ${media.length} \u5F20`,
      onPrev: active > 0 ? () => setActive(active - 1) : void 0,
      onNext: active < media.length - 1 ? () => setActive(active + 1) : void 0,
      onClose
    }
  );
}
function PlanView({ courseId, revision, onChanged, notify, onStartLesson }) {
  const { data, error, loading, reload } = useResource(() => api.plan(courseId), [courseId, revision]);
  const [generating, setGenerating] = (0, import_react3.useState)(false);
  const [filter, setFilter] = (0, import_react3.useState)("todo");
  const [form, setForm] = (0, import_react3.useState)({ goal: "", examDate: "", dailyMinutes: 45 });
  (0, import_react3.useEffect)(() => {
    if (!data?.plan) return;
    setForm({ goal: data.plan.goal ?? "", examDate: data.profile?.examDate ?? "", dailyMinutes: data.plan.dailyMinutes ?? 45 });
  }, [data?.plan?.id, data?.plan?.version]);
  const generate = async () => {
    setGenerating(true);
    try {
      const result = await api.generatePlan(courseId, { goal: form.goal, examDate: form.examDate, dailyMinutes: Number(form.dailyMinutes) || 45 });
      notify(`\u6392\u597D\u4E86\uFF1A${result.plan.tasks.length} \u4E2A\u4EFB\u52A1\uFF0C\u5230 ${result.plan.targetDate}`);
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u751F\u6210\u5931\u8D25");
    } finally {
      setGenerating(false);
    }
  };
  const setTaskStatus = async (task, status) => {
    try {
      await api.updateTask(courseId, task.id, { status });
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u66F4\u65B0\u5931\u8D25");
    }
  };
  const plan = data?.plan ?? null;
  const progress = data?.progress ?? { total: 0, done: 0, percent: 0 };
  const grouped = (0, import_react3.useMemo)(() => {
    const tasks = (plan?.tasks ?? []).filter((task) => filter === "all" || task.status !== "done");
    const byDate = /* @__PURE__ */ new Map();
    for (const task of tasks) byDate.set(task.dueDate || "\u672A\u6392\u671F", [...byDate.get(task.dueDate || "\u672A\u6392\u671F") ?? [], task]);
    return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [plan, filter]);
  if (loading && !data) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Loading, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ErrorBox, { error });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 17, fontWeight: 650 }, children: "\u5B66\u4E60\u8BA1\u5212" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", children: plan ? `\u5230 ${plan.targetDate} \u5B66\u5B8C \xB7 \u6BCF\u5929 ${plan.dailyMinutes} \u5206\u949F \xB7 \u5171 ${plan.tasks.length} \u4E2A\u4EFB\u52A1` : "\u8FD8\u6CA1\u6392" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: filter === "todo" ? "primary" : "default", onClick: () => setFilter("todo"), children: "\u6CA1\u505A\u5B8C\u7684" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: filter === "all" ? "primary" : "default", onClick: () => setFilter("all"), children: "\u5168\u90E8" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Section, { title: plan ? "\u6539\u4E00\u6539\u518D\u6392" : "\u6392\u4E00\u4EFD\u8BA1\u5212", hint: "\u6539\u5B8C\u91CD\u6392\u65F6\uFF0C\u5DF2\u7ECF\u5B8C\u6210\u7684\u4EFB\u52A1\u4E0D\u4F1A\u88AB\u6E05\u6389", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid cols-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Field, { label: "\u8FD9\u6B21\u60F3\u8FBE\u5230\u4EC0\u4E48", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            className: "eg-input",
            value: form.goal,
            placeholder: "\u6BD4\u5982\uFF1A\u4E24\u5468\u5185\u4F1A\u505A\u4E8C\u6781\u7BA1\u7535\u8DEF\u9898",
            onChange: (event) => setForm({ ...form, goal: event.target.value })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Field, { label: "\u8003\u8BD5\u6216\u622A\u6B62\u65E5\u671F", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            className: "eg-input",
            type: "date",
            value: form.examDate,
            onChange: (event) => setForm({ ...form, examDate: event.target.value })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Field, { label: "\u6BCF\u5929\u80FD\u5B66\u591A\u4E45\uFF08\u5206\u949F\uFF09", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            className: "eg-input",
            type: "number",
            min: 10,
            max: 480,
            value: form.dailyMinutes,
            onChange: (event) => setForm({ ...form, dailyMinutes: Number(event.target.value) })
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { variant: "primary", loading: generating, onClick: generate, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "spark", size: 14 }),
          plan ? "\u91CD\u65B0\u6392" : "\u6392\u8BA1\u5212"
        ] }),
        plan ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { size: "sm", onClick: onStartLesson, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "book", size: 13 }),
          "\u5F00\u59CB\u5B66\u7B2C\u4E00\u8BFE"
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-muted eg-right", children: [
          progress.done,
          "/",
          progress.total,
          " \u5B8C\u6210 \xB7 ",
          progress.percent,
          "%"
        ] })
      ] }),
      progress.total ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Progress, { value: progress.percent / 100 }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-muted", style: { fontSize: 11.5 }, children: '\u6392\u5E8F\u903B\u8F91\uFF1A\u5148\u6309\u8D44\u6599\u91CC\u7684\u7AE0\u8282\u987A\u5E8F\uFF0C\u518D\u6309"\u5FC5\u987B\u5148\u5B66\u8C01"\uFF0C\u6BCF\u4E2A\u5355\u5143\u914D\u4E00\u6B21\u8BB2\u89E3\u548C\u4E00\u6B21\u7EC3\u4E60\uFF0C\u5B66\u5B8C\u5728 1\u30013\u30017 \u5929\u540E\u5404\u590D\u4E60\u4E00\u6B21\u3002' })
    ] }),
    !plan ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      EmptyState,
      {
        title: "\u8FD8\u6CA1\u6392\u8BA1\u5212",
        text: "\u6392\u597D\u4E4B\u540E\uFF0C\u6BCF\u5929\u6253\u5F00\u5C31\u80FD\u770B\u5230\u4ECA\u5929\u8BE5\u5B66\u4EC0\u4E48\uFF0C\u4E0D\u7528\u81EA\u5DF1\u60F3\u53BB\u54EA\u4E00\u6B65\u3002",
        action: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "primary", loading: generating, onClick: generate, children: "\u6392\u8BA1\u5212" })
      }
    ) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-grid", style: { gap: 14 }, children: [
      grouped.map(([date, tasks]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { title: date === "\u672A\u6392\u671F" ? "\u6CA1\u6392\u65E5\u671F" : `${date} \xB7 ${tasks.length} \u9879`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "eg-list", children: tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, "data-active": task.status === "doing", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-dot", "data-tone": task.status === "done" ? "success" : TASK_TONE[task.type] ?? "brand" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-main", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-title", style: { textDecoration: task.status === "done" ? "line-through" : "none" }, children: task.title }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "eg-list-sub", children: [
            TASK_TEXT[task.type] ?? task.type,
            " \xB7 \u7EA6 ",
            task.estimatedMinutes,
            " \u5206\u949F \xB7 ",
            task.conceptIds.length,
            " \u4E2A\u77E5\u8BC6\u70B9"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "eg-list-side", children: task.status !== "done" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
            void setTaskStatus(task, "done");
          }, title: "\u6807\u8BB0\u5B8C\u6210", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "check", size: 13 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
            void setTaskStatus(task, "skipped");
          }, children: "\u8DF3\u8FC7" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Badge, { tone: "success", children: "\u5DF2\u5B8C\u6210" }) })
      ] }, task.id)) }) }, date)),
      !grouped.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(EmptyState, { title: "\u90FD\u505A\u5B8C\u4E86", text: "\u6362\u4E2A\u7B5B\u9009\u770B\u770B\u5168\u90E8\uFF0C\u6216\u8005\u53BB\u7EC3\u4E00\u7EC4\u65B0\u9898\u3002" }) }) : null
    ] })
  ] });
}

// src/client/views/Practice.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function LessonView({ courseId, revision, onChanged, notify, onPractice }) {
  const [taskId, setTaskId] = (0, import_react4.useState)("");
  const planResource = useResource(() => api.plan(courseId), [courseId, revision]);
  const pending = (planResource.data?.plan?.tasks ?? []).filter((task2) => task2.status !== "done" && task2.status !== "skipped");
  const { data, error, loading, reload } = useResource(
    () => api.lesson(courseId, taskId || void 0),
    [courseId, revision, taskId]
  );
  const lesson = data;
  const [recall, setRecall] = (0, import_react4.useState)("");
  const [revealed, setRevealed] = (0, import_react4.useState)(false);
  const [rating, setRating] = (0, import_react4.useState)(false);
  const [figure, setFigure] = (0, import_react4.useState)(null);
  (0, import_react4.useEffect)(() => {
    setRecall("");
    setRevealed(false);
  }, [data?.task?.id]);
  const complete = async () => {
    if (!lesson?.task) {
      notify("\u6CA1\u6709\u53EF\u5B8C\u6210\u7684\u4EFB\u52A1");
      return;
    }
    try {
      await api.updateTask(courseId, lesson.task.id, { status: "done" });
      notify("\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF0C\u5DF2\u6309\u8BA1\u5212\u63A8\u8FDB");
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u66F4\u65B0\u5931\u8D25");
    }
  };
  const selfRate = async (value) => {
    if (!lesson?.cards?.length) return;
    setRating(true);
    try {
      for (const card of lesson.cards) await api.gradeReview(courseId, card.id, value);
      if (recall.trim()) {
        await api.event(courseId, {
          type: "recall",
          conceptId: lesson.cards[0].id,
          evidence: `\u56DE\u5FC6\uFF1A${recall.slice(0, 800)}`,
          taskId: lesson.task?.id ?? null
        });
      }
      notify("\u5DF2\u8BB0\u5F55\u672C\u6B21\u56DE\u5FC6\u4E0E\u590D\u4E60\u65F6\u95F4");
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u8BB0\u5F55\u5931\u8D25");
    } finally {
      setRating(false);
    }
  };
  if (loading && !lesson) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Loading, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ErrorBox, { error });
  if (!lesson) return null;
  if (!lesson.cards.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      EmptyState,
      {
        title: "\u8FD8\u6CA1\u6709\u53EF\u8BB2\u89E3\u7684\u77E5\u8BC6\u70B9",
        text: pending.length ? "\u8FD9\u4E2A\u4EFB\u52A1\u8FD8\u6CA1\u6709\u5173\u8054\u6982\u5FF5\u2014\u2014\u5148\u5728\u300C\u8BA1\u5212\u300D\u91CC\u91CD\u65B0\u751F\u6210\uFF0C\u6216\u5230\u300C\u56FE\u8C31\u300D\u91CC\u9009\u4E00\u4E2A\u77E5\u8BC6\u70B9\u3002" : "\u5148\u4E0A\u4F20\u8D44\u6599\u5E76\u751F\u6210\u8BA1\u5212\uFF0C\u8BB2\u89E3\u9875\u4F1A\u6309\u8BA1\u5212\u5E26\u51FA\u8FD9\u4E00\u7EC4\u77E5\u8BC6\u70B9\u3002"
      }
    ) });
  }
  const task = lesson.task;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 17, fontWeight: 650 }, children: task?.title ?? "\u81EA\u7531\u5B66\u4E60" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-muted", children: [
          lesson.chapterTitle ? `${lesson.chapterTitle} \xB7 ` : "",
          lesson.cards.length,
          " \u4E2A\u77E5\u8BC6\u70B9",
          task ? ` \xB7 \u8BA1\u5212 ${task.dueDate} \xB7 ${task.estimatedMinutes} \u5206\u949F` : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
        pending.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("select", { className: "eg-select", style: { width: "auto" }, value: taskId, onChange: (event) => setTaskId(event.target.value), children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: "", children: "\u4E0B\u4E00\u4E2A\u4EFB\u52A1" }),
          pending.slice(0, 30).map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: item.id, children: item.title }, item.id))
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { size: "sm", onClick: () => onPractice({ mode: "practice", taskId: task?.id ?? null, conceptIds: lesson.cards.map((card) => card.id) }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "quiz", size: 13 }),
          "\u7EC3\u4E60\u8FD9\u4E00\u7EC4"
        ] }),
        task ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { size: "sm", variant: "primary", onClick: complete, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "check", size: 13 }),
          "\u6807\u8BB0\u5B8C\u6210"
        ] }) : null
      ] })
    ] }),
    lesson.cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("article", { className: "eg-concept-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-concept-name", children: card.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: masteryLabel(card.level).tone, children: masteryLabel(card.level).text }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-muted", children: [
            Math.round(card.mastery * 100),
            "%"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "eg-ask",
              title: "\u5E26\u7740\u8FD9\u4E2A\u77E5\u8BC6\u70B9\u53BB\u95EE\u53F3\u4FA7 AI \u5BFC\u5E08",
              onClick: () => askTutor(conceptAsk(card.name, card.definition), card.name),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "chat", size: 13 }),
                "\u95EE\u5BFC\u5E08"
              ]
            }
          ),
          card.sourceRefs[0]?.pageNo ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            Button,
            {
              size: "sm",
              variant: "ghost",
              title: "\u628A\u8FD9\u4E00\u9875\u753B\u51FA\u6765\u770B",
              onClick: () => setFigure({
                src: figureUrl(courseId, card.sourceRefs[0].documentId, card.sourceRefs[0].pageNo),
                title: `${card.name} \xB7 \u7B2C ${card.sourceRefs[0].pageNo} \u9875`
              }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "layers", size: 13 }),
                "\u770B\u539F\u6587\u56FE"
              ]
            }
          ) : null
        ] })
      ] }),
      card.definition ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-concept-def", children: card.definition }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-muted", children: "\u8D44\u6599\u91CC\u6CA1\u6709\u627E\u5230\u660E\u786E\u5B9A\u4E49\uFF0C\u8BF7\u5C55\u5F00\u4E0B\u65B9\u539F\u6587\u81EA\u884C\u786E\u8BA4\u3002" }),
      card.sourceRefs.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("details", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("summary", { className: "eg-muted", style: { cursor: "pointer" }, children: [
          "\u6765\u6E90\u539F\u6587\uFF08",
          card.sourceRefs.length,
          "\uFF09"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-grid", style: { gap: 8, marginTop: 8 }, children: card.sourceRefs.map((ref, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-quote", children: [
          ref.quote,
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-quote-source", children: [
            "\u7B2C ",
            ref.pageNo ?? "?",
            " \u9875"
          ] })
        ] }, index)) })
      ] }) : null,
      card.related.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-related", children: card.related.map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Badge, { tone: item.type === "prerequisite" ? "warn" : "business", children: [
        item.type === "prerequisite" ? "\u524D\u7F6E" : "\u76F8\u5173",
        "\uFF1A",
        item.name
      ] }, item.conceptId)) }) : null
    ] }, card.id)),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Section, { title: "\u5148\u522B\u770B\u4E66\uFF0C\u56DE\u5FC6\u4E00\u4E0B", hint: "\u5199\u4E0D\u51FA\u6765\u5F88\u6B63\u5E38\uFF0C\u8FD9\u4E00\u6B65\u5C31\u662F\u5728\u5E2E\u4F60\u8BB0\u4F4F", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-quote", children: lesson.recallPrompt }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "textarea",
        {
          className: "eg-textarea",
          value: recall,
          placeholder: "\u7528\u81EA\u5DF1\u7684\u8BDD\u5199\u4E0B\u6765\uFF08\u5199\u4E0D\u51FA\u6765\u4E5F\u6CA1\u5173\u7CFB\uFF0C\u8FD9\u662F\u8BB0\u5FC6\u68C0\u6D4B\uFF09",
          onChange: (event) => setRecall(event.target.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", onClick: () => setRevealed(true), children: "\u5BF9\u7167\u7B54\u6848" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "eg-ask",
            title: "\u8BA9\u5BFC\u5E08\u7528\u95EE\u9898\u5F15\u5BFC\u4F60\u56DE\u5FC6",
            onClick: () => askTutor(recallAsk(lesson.cards.map((card) => card.name), lesson.recallPrompt), "\u8FD9\u7EC4\u77E5\u8BC6\u70B9"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "chat", size: 13 }),
              "\u95EE\u5BFC\u5E08"
            ]
          }
        ),
        revealed ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-muted", children: "\u56DE\u5FC6\u8D28\u91CF\uFF1A" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: "danger", loading: rating, onClick: () => selfRate(1), children: "\u5FD8\u4E86" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", loading: rating, onClick: () => selfRate(2), children: "\u6A21\u7CCA" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: "primary", loading: rating, onClick: () => selfRate(3), children: "\u8BB0\u4F4F\u4E86" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: "primary", loading: rating, onClick: () => selfRate(4), children: "\u5F88\u719F" })
        ] }) : null
      ] }),
      revealed ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-feedback", "data-tone": "success", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-feedback-title", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "check", size: 14 }),
          "\u5BF9\u7167\u53C2\u8003\u7B54\u6848"
        ] }),
        lesson.cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: card.name }),
          "\uFF1A",
          card.definition || "\uFF08\u8D44\u6599\u91CC\u6CA1\u7ED9\u5B9A\u4E49\uFF0C\u53EF\u4EE5\u7FFB\u539F\u6587\uFF09"
        ] }, card.id))
      ] }) : null
    ] }),
    figure ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FigureModal, { src: figure.src, title: figure.title, hint: "\u7535\u8DEF\u56FE\u3001\u6CE2\u5F62\u8FD9\u7C7B\u5185\u5BB9\u6587\u5B57\u91CC\u6CA1\u6709\uFF0C\u9700\u8981\u770B\u6574\u9875\u6E32\u67D3\u56FE", onClose: () => setFigure(null) }) : null
  ] });
}
function QuizView({ courseId, request: request2, onChanged, notify, onOpenLesson, onOpenReview }) {
  const [state, setState] = (0, import_react4.useState)({ questions: [], index: 0, answer: "", result: null, results: [] });
  const [loading, setLoading] = (0, import_react4.useState)(true);
  const [error, setError] = (0, import_react4.useState)(null);
  const [submitting, setSubmitting] = (0, import_react4.useState)(false);
  const startedAt = (0, import_react4.useRef)(Date.now());
  const start = (0, import_react4.useCallback)(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createQuiz(courseId, {
        conceptIds: request2.conceptIds ?? null,
        taskId: request2.taskId ?? null,
        mode: request2.mode,
        count: request2.count ?? (request2.mode === "review" ? 6 : 5),
        strategy: request2.mode === "review" ? "weak" : "auto"
      });
      setState({ questions: data.questions, index: 0, answer: "", result: null, results: [] });
      startedAt.current = Date.now();
      if (!data.questions.length) setError(new Error("\u8FD9\u6279\u77E5\u8BC6\u70B9\u8FD8\u751F\u6210\u4E0D\u51FA\u9898\u76EE\uFF0C\u5148\u8865\u5145\u8D44\u6599\u6216\u6362\u4E2A\u77E5\u8BC6\u70B9\u8BD5\u8BD5\u3002"));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [courseId, request2.conceptIds, request2.taskId, request2.mode, request2.count]);
  (0, import_react4.useEffect)(() => {
    void start();
  }, [start]);
  const question = state.questions[state.index] ?? null;
  const submit = async (value) => {
    if (!question || state.result) return;
    const answer = value ?? state.answer;
    if (answer === "" || answer === void 0) {
      notify("\u5148\u4F5C\u7B54\u518D\u63D0\u4EA4");
      return;
    }
    setSubmitting(true);
    try {
      const result2 = await api.answer(courseId, {
        questionId: question.id,
        answer,
        mode: request2.mode,
        taskId: request2.taskId ?? void 0
      });
      setState((prev) => ({ ...prev, result: result2, results: [...prev.results, { question, result: result2 }] }));
      onChanged();
    } catch (err) {
      notify(err?.message ?? "\u63D0\u4EA4\u5931\u8D25");
    } finally {
      setSubmitting(false);
    }
  };
  const next = () => {
    setState((prev) => ({ ...prev, index: prev.index + 1, answer: "", result: null }));
  };
  (0, import_react4.useEffect)(() => {
    const onKey = (event) => {
      const target = event.target;
      const typing = target && ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (event.key === "Enter" && !event.shiftKey) {
        if (state.result) {
          event.preventDefault();
          next();
        } else if (!typing) {
          event.preventDefault();
          void submit();
        }
        return;
      }
      if (typing || state.result || !question?.options?.length) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < question.options.length) {
        event.preventDefault();
        void submit(String(index));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (loading) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Loading, { text: "\u6B63\u5728\u51C6\u5907\u9898\u76EE\u2026" });
  if (error) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Section, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ErrorBox, { error }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { onClick: () => {
          void start();
        }, children: "\u91CD\u8BD5" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "ghost", onClick: onOpenLesson, children: "\u56DE\u5230\u8BB2\u89E3" })
      ] })
    ] });
  }
  const done = state.index >= state.questions.length;
  if (done) {
    const total = state.results.length;
    const correct = state.results.filter((item) => item.result.grade.correct).length;
    const avg = total ? state.results.reduce((sum, item) => sum + item.result.grade.score, 0) / total : 0;
    const weak = state.results.filter((item) => !item.result.grade.correct).map((item) => item.question.conceptName);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Section, { title: "\u8FD9\u7EC4\u505A\u5B8C\u4E86", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-grid cols-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-stat", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-stat-value", children: [
              correct,
              "/",
              total
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-stat-label", children: "\u7B54\u5BF9\u51E0\u9053" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-stat", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-stat-value", children: [
              Math.round(avg * 100),
              "%"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-stat-label", children: "\u5E73\u5747\u6B63\u786E\u7387" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-stat", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-stat-value", children: new Set(weak).size }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-stat-label", children: "\u8FD8\u8981\u518D\u770B\u7684\u77E5\u8BC6\u70B9" })
          ] })
        ] }),
        weak.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-wrap", children: [...new Set(weak)].map((name2) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: "error", children: name2 }, name2)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-feedback", "data-tone": "success", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-feedback-title", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "check", size: 14 }),
          "\u90FD\u7B54\u5BF9\u4E86\uFF0C\u590D\u4E60\u65F6\u95F4\u5DF2\u7ECF\u6309\u8868\u73B0\u6392\u597D"
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { variant: "primary", onClick: () => {
            void start();
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "repeat", size: 13 }),
            "\u518D\u6765\u4E00\u7EC4"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { onClick: onOpenLesson, children: "\u56DE\u5230\u8BB2\u89E3" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "ghost", onClick: onOpenReview, children: "\u67E5\u770B\u590D\u4E60\u8BA1\u5212" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { title: "\u9010\u9898\u56DE\u987E", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-list", children: state.results.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-dot", "data-tone": item.result.grade.correct ? "success" : "error" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-main", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-title", children: [
            item.question.conceptName,
            " \xB7 ",
            typeLabel(item.question.type)
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-list-sub", children: item.result.grade.explanation })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-side eg-muted", children: [
          Math.round(item.result.grade.score * 100),
          "%"
        ] })
      ] }, index)) }) })
    ] });
  }
  const result = state.result;
  const correctIndex = result ? Number(result.grade.correctAnswer) : -1;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: "brand", children: request2.mode === "review" ? "\u590D\u4E60" : "\u7EC3\u4E60" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-muted", children: [
          state.index + 1,
          " / ",
          state.questions.length
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-row", style: { width: 160 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Progress, { value: state.index / state.questions.length }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Section, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-muted", children: [
          question?.conceptName,
          " \xB7 ",
          typeLabel(question?.type ?? "")
        ] }),
        result ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Badge, { tone: result.grade.correct ? "success" : "error", children: [
          result.grade.correct ? "\u7B54\u5BF9" : "\u7B54\u9519",
          " \xB7 ",
          Math.round(result.grade.score * 100),
          "%"
        ] }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-quiz-stem", children: question?.stem }),
      question && question.options.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-grid", style: { gap: 8 }, children: question.options.map((option, index) => {
        let status;
        if (result) {
          if (index === correctIndex) status = "correct";
          else if (String(index) === state.answer) status = "wrong";
        }
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "button",
          {
            type: "button",
            className: "eg-option",
            "data-state": status,
            disabled: Boolean(result),
            onClick: () => {
              setState((prev) => ({ ...prev, answer: String(index) }));
              void submit(String(index));
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-option-key", children: index + 1 }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: option })
            ]
          },
          index
        );
      }) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "textarea",
        {
          className: "eg-textarea",
          value: state.answer,
          disabled: Boolean(result),
          placeholder: question?.type === "cloze" ? "\u586B\u7A7A\uFF1A\u5199\u4E0B\u8FD9\u4E2A\u672F\u8BED" : "\u7528\u81EA\u5DF1\u7684\u8BDD\u56DE\u7B54",
          onChange: (event) => setState((prev) => ({ ...prev, answer: event.target.value }))
        }
      ),
      result ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-feedback", "data-tone": result.grade.correct ? "success" : "error", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-feedback-title", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: result.grade.correct ? "check" : "flag", size: 14 }),
          result.grade.correct ? "\u7B54\u5BF9\u4E86" : "\u8FD9\u9898\u6CA1\u5BF9\uFF0C\u770B\u770B\u4E3A\u4EC0\u4E48"
        ] }),
        result.grade.correctAnswer ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: "\u53C2\u8003\u7B54\u6848\uFF1A" }),
          answerText(result.grade.correctAnswer, result.grade.options)
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: result.grade.explanation }),
        result.grade.errorTags?.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-wrap", children: result.grade.errorTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Badge, { tone: "warn", children: tag }, tag)) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-muted", children: [
          "\u719F\u7EC3\u5EA6 ",
          Math.round((result.state?.mastery ?? 0) * 100),
          "% \xB7 \u4E0B\u6B21\u5B89\u6392\u5728\u4ECA\u5929\u4E4B\u540E ",
          formatDue(result.review?.due)
        ] }),
        question ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-row", style: { marginTop: 2 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "eg-ask",
            onClick: () => {
              const myAnswer = question.options.length ? answerText(state.answer, question.options) : state.answer;
              const expected = result.grade.correctAnswer ? answerText(result.grade.correctAnswer, result.grade.options) : result.grade.expected;
              askTutor(
                result.grade.correct ? conceptAsk(question.conceptName, result.grade.explanation) : mistakeAsk(question, myAnswer, expected),
                question.conceptName
              );
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "chat", size: 13 }),
              result.grade.correct ? "\u95EE\u5BFC\u5E08\uFF1A\u518D\u8BB2\u6DF1\u4E00\u70B9" : "\u95EE\u5BFC\u5E08\uFF1A\u4E3A\u4EC0\u4E48\u9519"
            ]
          }
        ) }) : null
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
        !result ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "primary", loading: submitting, disabled: !state.answer, onClick: () => {
            void submit();
          }, children: "\u63D0\u4EA4\uFF08Enter\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "ghost", onClick: () => next(), children: "\u8DF3\u8FC7" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { variant: "primary", onClick: next, children: [
          state.index + 1 >= state.questions.length ? "\u67E5\u770B\u7ED3\u679C" : "\u4E0B\u4E00\u9898",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "arrow-right", size: 13 })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-muted eg-right", children: [
          "\u952E\u76D8\uFF1A1-",
          question?.options.length || 4,
          " \u9009\u62E9 \xB7 Enter \u63D0\u4EA4 / \u4E0B\u4E00\u9898"
        ] })
      ] })
    ] })
  ] });
}
function answerText(answer, options) {
  const index = Number(answer);
  if (Array.isArray(options) && options.length && Number.isInteger(index) && options[index] !== void 0) {
    return options[index];
  }
  return answer;
}
function typeLabel(type) {
  return { choice: "\u9009\u62E9\u9898", "choice-reverse": "\u53CD\u5411\u9009\u62E9", cloze: "\u586B\u7A7A\u9898", judge: "\u5224\u65AD\u9898", short: "\u7B80\u7B54\u9898" }[type] ?? type;
}
function MistakesView({ courseId, revision, notify, onPractice }) {
  const { data, error, loading } = useResource(() => api.mistakes(courseId), [courseId, revision]);
  if (loading && !data) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Loading, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ErrorBox, { error });
  const groups = data?.groups ?? [];
  if (!groups.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EmptyState, { title: "\u8FD8\u6CA1\u6709\u9519\u9898", text: "\u7EC3\u4E60\u91CC\u7B54\u9519\u7684\u77E5\u8BC6\u70B9\u4F1A\u81EA\u52A8\u6536\u5230\u8FD9\u91CC\uFF0C\u8FD8\u4F1A\u544A\u8BC9\u4F60\u9519\u5728\u54EA\u4E00\u6B65\u3002" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 17, fontWeight: 650 }, children: "\u9519\u9898\u672C" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-muted", children: [
          "\u9519\u4E86 ",
          data.total,
          " \u6B21\uFF0C\u6D89\u53CA ",
          data.conceptCount,
          " \u4E2A\u77E5\u8BC6\u70B9"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { size: "sm", variant: "primary", onClick: () => onPractice(groups.slice(0, 6).map((group) => group.conceptId)), children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "repeat", size: 13 }),
        "\u628A\u8FD9\u4E9B\u518D\u7EC3\u4E00\u904D"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-grid", style: { gap: 12 }, children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      Section,
      {
        title: group.conceptName,
        hint: `\u9519 ${group.wrongCount} \u6B21 \xB7 \u6700\u8FD1 ${formatDue(new Date(group.lastAt).getTime())}`,
        actions: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "eg-ask",
              onClick: () => askTutor(groupAsk(group.conceptName, group.definition, (group.errorTags ?? []).map((tag) => tag.tag)), group.conceptName),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "chat", size: 13 }),
                "\u95EE\u5BFC\u5E08"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => onPractice([group.conceptId]), children: "\u91CD\u505A" })
        ] }),
        children: [
          group.definition ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-concept-def", style: { fontSize: 12 }, children: group.definition }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-wrap", children: group.errorTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Badge, { tone: "warn", children: [
            tag.tag,
            " \xD7",
            tag.count
          ] }, tag.tag)) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-list", children: group.attempts.map((attempt) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-main", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-title eg-ellipsis", children: [
                "\u6211\u7684\u7B54\u6848\uFF1A",
                attempt.answer || "\uFF08\u7A7A\uFF09"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-list-sub", children: attempt.errorTags?.join(" \xB7 ") || "\u2014" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-side eg-muted", children: [
              Math.round((attempt.score ?? 0) * 100),
              "%"
            ] })
          ] }, attempt.id)) })
        ]
      },
      group.conceptId
    )) })
  ] });
}
function ReviewView({ courseId, revision, notify, onChanged, onPractice }) {
  const { data, error, loading, reload } = useResource(() => api.reviews(courseId), [courseId, revision]);
  const [grading, setGrading] = (0, import_react4.useState)(null);
  const rate = async (conceptId, value) => {
    setGrading(conceptId);
    try {
      await api.gradeReview(courseId, conceptId, value);
      notify("\u5DF2\u66F4\u65B0\u4E0B\u6B21\u590D\u4E60\u65F6\u95F4");
      onChanged();
      await reload(true);
    } catch (err) {
      notify(err?.message ?? "\u66F4\u65B0\u5931\u8D25");
    } finally {
      setGrading(null);
    }
  };
  if (loading && !data) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Loading, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ErrorBox, { error });
  const due = data?.due ?? [];
  const upcoming = data?.upcoming ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 17, fontWeight: 650 }, children: "\u590D\u4E60" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-muted", children: [
          due.length,
          " \u4E2A\u4ECA\u5929\u8BE5\u590D\u4E60 \xB7 ",
          upcoming.length,
          " \u4E2A\u4EE5\u540E\u518D\u8BF4\uFF08\u6309\u8BB0\u5FC6\u66F2\u7EBF\u6392\u7684\uFF09"
        ] })
      ] }),
      due.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "eg-ask",
            onClick: () => askTutor(recallAsk(due.slice(0, 8).map((item) => item.name), "\u6211\u4ECA\u5929\u8981\u590D\u4E60\u8FD9\u4E9B\u5230\u671F\u77E5\u8BC6\u70B9\uFF0C\u8BF7\u5148\u5404\u7528\u4E00\u4E2A\u95EE\u9898\u8003\u6211\uFF0C\u522B\u5148\u7ED9\u7B54\u6848\u3002"), "\u590D\u4E60"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "chat", size: 13 }),
              "\u95EE\u5BFC\u5E08"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { size: "sm", variant: "primary", onClick: () => onPractice(due.slice(0, 10).map((item) => item.conceptId)), children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "repeat", size: 13 }),
          "\u5F00\u59CB\u590D\u4E60\uFF08",
          Math.min(10, due.length),
          "\uFF09"
        ] })
      ] }) : null
    ] }),
    due.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EmptyState, { title: "\u4ECA\u5929\u6CA1\u6709\u8BE5\u590D\u4E60\u7684", text: "\u505A\u5B8C\u7EC3\u4E60\u6216\u6807\u8BB0\u300C\u8BB0\u4F4F\u4E86\u300D\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u5DF1\u5B89\u6392\u4E0B\u6B21\u590D\u4E60\u65F6\u95F4\u3002" }) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-list", children: due.map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-dot", "data-tone": item.overdueDays > 2 ? "error" : "warn" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-main", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-list-title", children: item.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-sub", children: [
          item.overdueDays > 0 ? `\u903E\u671F ${item.overdueDays} \u5929` : "\u4ECA\u5929\u5230\u671F",
          " \xB7 \u638C\u63E1\u5EA6 ",
          Math.round(item.mastery * 100),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-side", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: "danger", loading: grading === item.conceptId, onClick: () => rate(item.conceptId, 1), children: "\u5FD8\u4E86" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", loading: grading === item.conceptId, onClick: () => rate(item.conceptId, 2), children: "\u56F0\u96BE" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { size: "sm", variant: "primary", loading: grading === item.conceptId, onClick: () => rate(item.conceptId, 3), children: "\u8BB0\u4F4F\u4E86" })
      ] })
    ] }, item.conceptId)) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { title: "\u540E\u9762\u8981\u590D\u4E60\u7684", hint: "\u6309\u65F6\u95F4\u6392", children: upcoming.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-list", children: upcoming.map((item) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "eg-list-row", style: { cursor: "default" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-dot", "data-tone": "brand" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-main", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-list-title", children: item.name }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "eg-list-sub", children: [
          "\u638C\u63E1\u5EA6 ",
          Math.round(item.mastery * 100),
          "% \xB7 \u7A33\u5B9A\u6027 ",
          item.stability?.toFixed?.(1) ?? item.stability,
          " \u5929"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "eg-list-side eg-muted", children: formatDue(item.due) })
    ] }, item.conceptId)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "eg-muted", children: "\u8FD8\u6CA1\u6709\u6392\u671F\uFF0C\u5148\u505A\u51E0\u9053\u9898\u3002" }) })
  ] });
}

// src/client/views/Graph.tsx
var import_react5 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var CANVAS_W = 1240;
var CANVAS_H = 780;
var PAD = 80;
var TIER = (mastery) => mastery >= 0.85 ? "mastered" : mastery >= 0.6 ? "familiar" : mastery >= 0.3 ? "learning" : "weak";
var CHAPTER_PALETTE = ["var(--eg-brand)", "var(--eg-success)", "var(--eg-warn)", "var(--eg-info)", "var(--eg-error)", "#8b5cf6", "#0ea5e9"];
var TIER_COLOR = {
  mastered: "var(--eg-success)",
  familiar: "var(--eg-info)",
  learning: "var(--eg-warn)",
  weak: "var(--eg-error)",
  untouched: "var(--eg-text-3)"
};
function convexHull(points) {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
function hullPath(points, expand = 34) {
  if (points.length < 3) return "";
  const cx = points.reduce((n, p) => n + p.x, 0) / points.length;
  const cy = points.reduce((n, p) => n + p.y, 0) / points.length;
  const moved = points.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + dx / len * expand, y: p.y + dy / len * expand };
  });
  const count = moved.length;
  let d = `M ${moved[0].x.toFixed(1)} ${moved[0].y.toFixed(1)}`;
  for (let i = 0; i < count; i += 1) {
    const p0 = moved[(i - 1 + count) % count];
    const p1 = moved[i];
    const p2 = moved[(i + 1) % count];
    const p3 = moved[(i + 2) % count];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d} Z`;
}
function buildLayout(graph) {
  const nodes = graph.nodes;
  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const chapters = [...graph.chapters].sort((a, b) => a.order - b.order);
  const groups = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    const key = node.chapterId ?? "__none__";
    groups.set(key, [...groups.get(key) ?? [], index.get(node.id)]);
  }
  const W = CANVAS_W;
  const H = CANVAS_H;
  const xs = new Float64Array(nodes.length);
  const ys = new Float64Array(nodes.length);
  const vx = new Float64Array(nodes.length);
  const vy = new Float64Array(nodes.length);
  const groupKeys = [...groups.keys()];
  const centroids = /* @__PURE__ */ new Map();
  groupKeys.forEach((key, gi) => {
    const angle = gi / Math.max(1, groupKeys.length) * Math.PI * 2;
    const radius = groupKeys.length === 1 ? 0 : Math.min(W, H) * 0.3;
    const cx = W / 2 + Math.cos(angle) * radius;
    const cy = H / 2 + Math.sin(angle) * radius;
    centroids.set(key, { x: cx, y: cy });
    const members = groups.get(key);
    members.forEach((nodeIndex, mi) => {
      const a = mi / Math.max(1, members.length) * Math.PI * 2;
      const r = 30 + mi % 3 * 22;
      xs[nodeIndex] = cx + Math.cos(a) * r + (Math.random() - 0.5) * 10;
      ys[nodeIndex] = cy + Math.sin(a) * r + (Math.random() - 0.5) * 10;
    });
  });
  const degree = /* @__PURE__ */ new Map();
  for (const edge of graph.edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  const ITER = 300;
  const density = 1 + Math.min(2.4, nodes.length / 90);
  for (let step = 0; step < ITER; step += 1) {
    const cooling = 1 - step / ITER;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        let dx = xs[i] - xs[j];
        let dy = ys[i] - ys[j];
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 1) {
          dx = (Math.random() - 0.5) * 2;
          dy = (Math.random() - 0.5) * 2;
          dist2 = 4;
        }
        const dist = Math.sqrt(dist2);
        const force = Math.min(18, 3600 * density / dist2);
        const fx = dx / dist * force;
        const fy = dy / dist * force;
        vx[i] += fx;
        vy[i] += fy;
        vx[j] -= fx;
        vy[j] -= fy;
      }
    }
    for (const edge of graph.edges) {
      const a = index.get(edge.source);
      const b = index.get(edge.target);
      if (a === void 0 || b === void 0) continue;
      const targetLen = (edge.type === "prerequisite" ? 130 : 168) * (1 + Math.min(0.8, nodes.length / 220));
      const dx = xs[b] - xs[a];
      const dy = ys[b] - ys[a];
      const dist = Math.hypot(dx, dy) || 1;
      const strength = 0.018 + (edge.weight ?? 0.5) * 0.03;
      const pull = (dist - targetLen) * strength;
      const fx = dx / dist * pull;
      const fy = dy / dist * pull;
      vx[a] += fx;
      vy[a] += fy;
      vx[b] -= fx;
      vy[b] -= fy;
    }
    for (const [key, members] of groups) {
      const center = centroids.get(key);
      for (const nodeIndex of members) {
        vx[nodeIndex] += (center.x - xs[nodeIndex]) * 0.012;
        vy[nodeIndex] += (center.y - ys[nodeIndex]) * 0.012;
      }
    }
    for (let i = 0; i < nodes.length; i += 1) {
      vx[i] += (W / 2 - xs[i]) * 16e-4;
      vy[i] += (H / 2 - ys[i]) * 16e-4;
      vx[i] *= 0.72;
      vy[i] *= 0.72;
      const speed = Math.hypot(vx[i], vy[i]);
      const cap = 14 * cooling + 2;
      if (speed > cap) {
        vx[i] = vx[i] / speed * cap;
        vy[i] = vy[i] / speed * cap;
      }
      xs[i] += vx[i] * cooling;
      ys[i] += vy[i] * cooling;
    }
  }
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
  const positions = /* @__PURE__ */ new Map();
  nodes.forEach((node, i) => {
    positions.set(node.id, {
      x: PAD + (xs[i] - minX) * scale + (W - PAD * 2 - spanX * scale) / 2,
      y: PAD + (ys[i] - minY) * scale + (H - PAD * 2 - spanY * scale) / 2
    });
  });
  const hulls = chapters.map((chapter) => {
    const members = nodes.filter((node) => node.chapterId === chapter.id);
    if (members.length < 2) return null;
    const points = members.map((node) => positions.get(node.id)).filter(Boolean);
    const hull = convexHull(points);
    const path = hullPath(hull, members.length > 6 ? 42 : 30);
    const center = {
      x: points.reduce((n, p) => n + p.x, 0) / points.length,
      y: points.reduce((n, p) => n + p.y, 0) / points.length
    };
    return { id: chapter.id, title: chapter.title, path, center };
  }).filter(Boolean);
  return { positions, hulls, degree };
}
function GraphView({ courseId, revision, notify, onPractice }) {
  const { data, error, loading } = useResource(() => api.graph(courseId), [courseId, revision]);
  const graph = data;
  const [selected, setSelected] = (0, import_react5.useState)(null);
  const [hovered, setHovered] = (0, import_react5.useState)(null);
  const [tooltip, setTooltip] = (0, import_react5.useState)(null);
  const [zoom, setZoom] = (0, import_react5.useState)(1);
  const [offset, setOffset] = (0, import_react5.useState)({ x: 0, y: 0 });
  const [chapterFilter, setChapterFilter] = (0, import_react5.useState)("");
  const [query, setQuery] = (0, import_react5.useState)("");
  const [showRelated, setShowRelated] = (0, import_react5.useState)(true);
  const [animated, setAnimated] = (0, import_react5.useState)(true);
  const drag = (0, import_react5.useRef)(null);
  const [panning, setPanning] = (0, import_react5.useState)(false);
  const shellRef = (0, import_react5.useRef)(null);
  const fit = (0, import_react5.useCallback)(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);
  const visibleGraph = (0, import_react5.useMemo)(() => {
    if (!graph) return null;
    if (!chapterFilter) return graph;
    const nodes = graph.nodes.filter((node) => node.chapterId === chapterFilter);
    const ids = new Set(nodes.map((node) => node.id));
    return {
      ...graph,
      nodes,
      edges: graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
      chapters: graph.chapters.filter((chapter) => chapter.id === chapterFilter)
    };
  }, [graph, chapterFilter]);
  const layout = (0, import_react5.useMemo)(() => visibleGraph ? buildLayout(visibleGraph) : null, [visibleGraph]);
  (0, import_react5.useEffect)(() => {
    setAnimated(true);
    const timer = window.setTimeout(() => setAnimated(false), 2e3);
    return () => window.clearTimeout(timer);
  }, [graph]);
  const neighbors = (0, import_react5.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    if (!graph) return map;
    for (const edge of graph.edges) {
      if (!map.has(edge.source)) map.set(edge.source, /* @__PURE__ */ new Set());
      if (!map.has(edge.target)) map.set(edge.target, /* @__PURE__ */ new Set());
      map.get(edge.source).add(edge.target);
      map.get(edge.target).add(edge.source);
    }
    return map;
  }, [graph]);
  const large = (visibleGraph?.nodes.length ?? 0) > 40;
  const chapterColor = (0, import_react5.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    (graph?.chapters ?? []).forEach((chapter, index) => map.set(chapter.id, CHAPTER_PALETTE[index % CHAPTER_PALETTE.length]));
    return map;
  }, [graph]);
  const colorOf = (node) => chapterColor.get(node.chapterId ?? "") ?? "var(--eg-brand)";
  (0, import_react5.useEffect)(() => {
    if (!graph || chapterFilter || graph.nodes.length <= 60) return;
    const top = [...graph.chapters].sort((a, b) => (b.conceptCount ?? 0) - (a.conceptCount ?? 0))[0];
    if (top) setChapterFilter(top.id);
  }, [graph, chapterFilter]);
  if (loading && !graph) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Loading, {});
  if (error) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ErrorBox, { error });
  if (!graph || !layout) return null;
  if (!graph.nodes.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Section, { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(EmptyState, { title: "\u8FD8\u6CA1\u6709\u77E5\u8BC6\u56FE\u8C31", text: "\u4E0A\u4F20\u8D44\u6599\u5E76\u7B49\u5B83\u89E3\u6790\u5B8C\uFF0C\u8FD9\u91CC\u5C31\u4F1A\u753B\u51FA\u8BFE\u7A0B\u7684\u6982\u5FF5\u548C\u5B83\u4EEC\u7684\u5148\u540E\u5173\u7CFB\u3002" }) });
  }
  const focusId = hovered ?? selected;
  const focusSet = focusId ? /* @__PURE__ */ new Set([focusId, ...neighbors.get(focusId) ?? []]) : null;
  const q = query.trim();
  const matches = q ? new Set(graph.nodes.filter((node) => node.name.toLowerCase().includes(q.toLowerCase())).map((node) => node.id)) : null;
  const visible = (node) => !chapterFilter || node.chapterId === chapterFilter;
  const edges = (visibleGraph?.edges ?? []).filter((edge) => showRelated || edge.type === "prerequisite");
  const selectedNode = graph.nodes.find((node) => node.id === selected) ?? null;
  const selectedRelated = selectedNode ? graph.edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).map((edge) => graph.nodes.find((node) => node.id === (edge.source === selectedNode.id ? edge.target : edge.source))?.name).filter((name2) => Boolean(name2)).slice(0, 6) : [];
  const mastered = graph.nodes.filter((node) => node.mastery >= 0.85).length;
  const showLabels = !large || zoom > 1.2;
  const hullOpacity = large && !chapterFilter && !focusId ? 0 : 1;
  const onPointerDown = (event) => {
    if (event.target.closest(".eg-graph-node")) return;
    drag.current = { startX: event.clientX, startY: event.clientY, ox: offset.x, oy: offset.y };
    setPanning(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!drag.current) return;
    setOffset({ x: drag.current.ox + (event.clientX - drag.current.startX), y: drag.current.oy + (event.clientY - drag.current.startY) });
  };
  const onPointerUp = () => {
    drag.current = null;
    setPanning(false);
  };
  const onWheel = (event) => {
    event.preventDefault();
    const next = Math.max(0.45, Math.min(2.6, zoom - event.deltaY * 12e-4));
    setZoom(next);
  };
  const focusNode = (node) => {
    const point = layout.positions.get(node.id);
    if (!point) return;
    setSelected(node.id);
    setZoom(1.35);
    setOffset({ x: (CANVAS_W / 2 - point.x) * 1.35, y: (CANVAS_H / 2 - point.y) * 1.35 });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-grid", style: { gap: 14 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-row between", style: { alignItems: "flex-end" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 18, fontWeight: 660, letterSpacing: "-0.2px" }, children: "\u77E5\u8BC6\u56FE\u8C31" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-graph-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
            graph.nodes.length,
            " \u4E2A\u77E5\u8BC6\u70B9"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
            graph.edges.length,
            " \u6761\u5173\u7CFB"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
            mastered,
            " \u4E2A\u5DF2\u638C\u63E1"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: '\u7EBF\u8D8A\u5B9E\uFF0C\u8D8A\u50CF"\u5148\u5B66\u5B83\u624D\u80FD\u5B66\u5B83"' })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "input",
          {
            className: "eg-input",
            style: { width: 160 },
            placeholder: "\u627E\u4E00\u4E2A\u77E5\u8BC6\u70B9",
            value: query,
            onChange: (event) => setQuery(event.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", variant: showRelated ? "primary" : "default", onClick: () => setShowRelated((value) => !value), children: "\u76F8\u5173\u8FB9" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 10, alignItems: "center", minWidth: 0, maxWidth: "100%" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        "select",
        {
          className: "eg-select",
          style: { width: 210, flex: "none" },
          value: chapterFilter,
          onChange: (event) => setChapterFilter(event.target.value),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("option", { value: "", children: [
              "\u5168\u90E8\u7AE0\u8282\uFF08",
              graph.chapters.length,
              "\uFF09"
            ] }),
            graph.chapters.filter((chapter) => graph.nodes.some((node) => node.chapterId === chapter.id)).map((chapter) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: chapter.id, children: chapter.title }, chapter.id))
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type: "button", className: "eg-graph-chip", "data-active": !chapterFilter, style: { flex: "none", whiteSpace: "nowrap" }, onClick: () => setChapterFilter(""), children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", { style: { background: "var(--eg-brand)" } }),
          "\u5168\u90E8"
        ] }),
        graph.chapters.filter((chapter) => graph.nodes.some((node) => node.chapterId === chapter.id)).map((chapter, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "button",
          {
            type: "button",
            className: "eg-graph-chip",
            "data-active": chapterFilter === chapter.id,
            style: { flex: "none" },
            onClick: () => setChapterFilter(chapterFilter === chapter.id ? "" : chapter.id),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", { style: { background: CHAPTER_PALETTE[index % CHAPTER_PALETTE.length] } }),
              chapter.title.length > 14 ? `${chapter.title.slice(0, 14)}\u2026` : chapter.title
            ]
          },
          chapter.id
        ))
      ] })
    ] }),
    chapterFilter ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-row", style: { marginTop: -6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setChapterFilter(""), children: "\u2190 \u56DE\u5230\u7AE0\u8282\u603B\u89C8" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "eg-muted", style: { fontSize: 12 }, children: "\u5F53\u524D\u53EA\u770B\u8FD9\u4E00\u7AE0\u3002" })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-graph-shell", ref: shellRef, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        "svg",
        {
          className: "eg-graph-svg",
          viewBox: `0 0 ${CANVAS_W} ${CANVAS_H}`,
          preserveAspectRatio: "xMidYMid meet",
          "data-panning": panning,
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerLeave: onPointerUp,
          onWheel,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("defs", { children: [
              Object.entries(TIER_COLOR).map(([tier, color]) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("radialGradient", { id: `eg-node-${tier}`, cx: "35%", cy: "30%", r: "75%", children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("stop", { offset: "0%", stopColor: color, stopOpacity: "0.95" }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("stop", { offset: "100%", stopColor: color, stopOpacity: "0.62" })
              ] }, tier)),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("filter", { id: "eg-soft", x: "-60%", y: "-60%", width: "220%", height: "220%", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("feGaussianBlur", { stdDeviation: "7" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("marker", { id: "eg-arrow", markerWidth: "9", markerHeight: "9", refX: "8", refY: "3.2", orient: "auto", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M0 0 L6.5 3.2 L0 6.4 Z", fill: "var(--eg-text-3)", opacity: "0.75" }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("g", { transform: `translate(${offset.x} ${offset.y}) scale(${zoom})`, children: [
              layout.hulls.map((hull) => {
                const hasFocus = focusSet ? [...focusSet ?? []].some((id) => graph.nodes.find((n) => n.id === id)?.chapterId === hull.id) : false;
                const dim = Boolean(focusSet && !hasFocus || chapterFilter && chapterFilter !== hull.id);
                const faded = hullOpacity === 0 && !hasFocus;
                return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("g", { className: "eg-graph-hull", "data-dim": dim, opacity: faded ? 0.18 : dim ? 0.5 : 1, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                    "path",
                    {
                      d: hull.path,
                      fill: chapterColor.get(hull.id) ?? "var(--eg-brand)",
                      fillOpacity: large ? 0.04 : 0.06,
                      stroke: chapterColor.get(hull.id) ?? "var(--eg-brand)",
                      strokeOpacity: large ? 0.12 : 0.2,
                      strokeWidth: large ? 10 : 16,
                      strokeLinejoin: "round"
                    }
                  ),
                  hasFocus || !large && !chapterFilter || chapterFilter === hull.id ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", { x: hull.center.x, y: hull.center.y - 6, textAnchor: "middle", fontSize: "12.5", fontWeight: "600", fill: "var(--eg-text-3)", children: hull.title }) : null
                ] }, hull.id);
              }),
              edges.map((edge, index) => {
                const from = layout.positions.get(edge.source);
                const to = layout.positions.get(edge.target);
                if (!from || !to) return null;
                const related = focusSet ? focusSet.has(edge.source) && focusSet.has(edge.target) : true;
                const isPrereq = edge.type === "prerequisite";
                const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.07;
                const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.07;
                return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  "path",
                  {
                    className: animated ? "eg-edge-in" : void 0,
                    style: animated ? { animationDelay: `${Math.min(600, index * 8)}ms` } : void 0,
                    d: `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`,
                    fill: "none",
                    stroke: isPrereq ? `color-mix(in srgb, ${chapterColor.get(graph.nodes.find((n) => n.id === edge.source)?.chapterId ?? "") ?? "var(--eg-warn)"} 62%, var(--eg-text-3))` : "var(--eg-border-strong)",
                    strokeWidth: isPrereq ? 1.15 + (edge.weight ?? 0.5) * 0.9 : 1,
                    strokeDasharray: isPrereq ? void 0 : "3 5",
                    strokeOpacity: related ? isPrereq ? large ? 0.34 : 0.55 : large ? 0.16 : 0.38 : 0.05,
                    markerEnd: isPrereq ? "url(#eg-arrow)" : void 0
                  },
                  edge.id ?? `${edge.source}-${edge.target}-${index}`
                );
              }),
              graph.nodes.filter(visible).map((node, index) => {
                const point = layout.positions.get(node.id);
                if (!point) return null;
                const degree = layout.degree.get(node.id) ?? 0;
                const base = large ? 5.2 : 8;
                const spread = large ? 5 : 9;
                const radius = base + Math.min(spread, degree * (large ? 0.7 : 1.35)) * (0.72 + (node.confidence ?? 0.5) * 0.28);
                const tier = node.attempts ? TIER(node.mastery) : "untouched";
                const dim = Boolean(focusSet && !focusSet.has(node.id) || matches && !matches.has(node.id));
                const isFocus = focusId === node.id;
                const isMatch = matches?.has(node.id);
                return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  "g",
                  {
                    className: "eg-graph-node",
                    "data-focus": isFocus,
                    "data-dim": dim,
                    transform: `translate(${point.x} ${point.y})`,
                    onClick: () => focusNode(node),
                    onPointerEnter: (event) => {
                      setHovered(node.id);
                      const rect = shellRef.current?.getBoundingClientRect();
                      if (rect) setTooltip({ x: event.clientX - rect.left + 14, y: event.clientY - rect.top + 12, node });
                    },
                    onPointerMove: (event) => {
                      const rect = shellRef.current?.getBoundingClientRect();
                      if (rect && tooltip) setTooltip({ x: event.clientX - rect.left + 14, y: event.clientY - rect.top + 12, node });
                    },
                    onPointerLeave: () => {
                      setHovered(null);
                      setTooltip(null);
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("g", { className: animated ? "eg-node-in" : void 0, style: animated ? { animationDelay: `${Math.min(700, index * 14)}ms` } : void 0, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { className: "eg-node-halo", r: radius * 2.4, fill: colorOf(node), filter: "url(#eg-soft)" }),
                      isMatch ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { className: "eg-pulse", r: radius + 4, fill: "none", stroke: "var(--eg-brand)", strokeWidth: "2" }) : null,
                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                        "circle",
                        {
                          r: radius,
                          fill: node.attempts ? `url(#eg-node-${tier})` : `color-mix(in srgb, ${colorOf(node)} 42%, var(--eg-layer2))`,
                          stroke: isFocus ? "var(--eg-brand)" : node.attempts ? "rgba(255,255,255,.55)" : `color-mix(in srgb, ${colorOf(node)} 78%, transparent)`,
                          strokeWidth: isFocus ? 2.4 : 1
                        }
                      ),
                      (showLabels || isFocus || isMatch) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", { x: radius + 7, y: 4, fontSize: "11.5", fill: "var(--eg-text)", opacity: dim ? 0.4 : 0.92, children: node.name.length > 14 ? `${node.name.slice(0, 14)}\u2026` : node.name })
                    ] })
                  },
                  node.id
                );
              })
            ] })
          ]
        }
      ),
      tooltip ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-graph-tooltip", style: { left: tooltip.x, top: tooltip.y }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("b", { children: tooltip.node.name }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "eg-muted", children: [masteryLabel(tooltip.node.level).text, `\u719F\u7EC3\u5EA6 ${Math.round(tooltip.node.mastery * 100)}%`, `\u7EC3\u8FC7 ${tooltip.node.attempts} \u6B21`].join(" \xB7 ") }),
        tooltip.node.definition ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { marginTop: 4, color: "var(--eg-text-2)" }, children: tooltip.node.definition.slice(0, 90) }) : null
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-graph-tools", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", onClick: () => setZoom((value) => Math.min(2.6, value + 0.15)), children: "\uFF0B" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", onClick: () => setZoom((value) => Math.max(0.45, value - 0.15)), children: "\uFF0D" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", onClick: fit, children: "\u9002\u914D" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eg-graph-legend", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "eg-dot", "data-tone": "success" }),
          "\u5DF2\u638C\u63E1"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "eg-dot", "data-tone": "brand" }),
          "\u719F\u6089"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "eg-dot", "data-tone": "warn" }),
          "\u5B66\u4E60\u4E2D"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "eg-dot", "data-tone": "error" }),
          "\u8584\u5F31"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "\u865A\u7EBF\u5706 = \u8FD8\u6CA1\u5B66\u8FC7" })
      ] })
    ] }),
    selectedNode ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      Section,
      {
        title: selectedNode.name,
        hint: `${masteryLabel(selectedNode.level).text} \xB7 \u719F\u7EC3\u5EA6 ${Math.round(selectedNode.mastery * 100)}% \xB7 \u7EC3\u8FC7 ${selectedNode.attempts} \u6B21 \xB7 ${selectedNode.sourceCount} \u5904\u539F\u6587`,
        actions: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "eg-ask",
              onClick: () => askTutor(graphAsk(selectedNode.name, selectedNode.definition, selectedRelated), selectedNode.name),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "chat", size: 13 }),
                "\u95EE\u5BFC\u5E08"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Button, { size: "sm", variant: "primary", onClick: () => onPractice([selectedNode.id]), children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "quiz", size: 13 }),
            "\u7EC3\u8FD9\u4E2A"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
            setSelected(null);
            fit();
          }, children: "\u6536\u8D77" })
        ] }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "eg-concept-def", children: selectedNode.definition || "\u8D44\u6599\u91CC\u6CA1\u7ED9\u51FA\u5B9A\u4E49\uFF0C\u53EF\u4EE5\u53BB\u300C\u8D44\u6599\u300D\u9875\u7FFB\u539F\u6587\u3002" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "eg-wrap", children: graph.edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).slice(0, 10).map((edge) => {
            const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
            const other = graph.nodes.find((node) => node.id === otherId);
            if (!other) return null;
            const isPrereq = edge.type === "prerequisite";
            const label = isPrereq ? edge.source === selectedNode.id ? `\u8981\u5148\u5B66\u4F1A\uFF1A${other.name}` : `\u5B66\u5B8C\u5B83\u624D\u80FD\u5B66\uFF1A${other.name}` : `\u76F8\u5173\uFF1A${other.name}`;
            return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Badge, { tone: isPrereq ? "warn" : "business", children: label }, edge.id ?? otherId);
          }) })
        ]
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "eg-muted", style: { fontSize: 12 }, children: "\u63D0\u793A\uFF1A\u70B9\u4E00\u4E2A\u70B9\u770B\u5B83\u662F\u4EC0\u4E48\u3001\u8981\u4E0D\u8981\u5148\u8865\u524D\u7F6E\uFF1B\u62D6\u52A8\u7A7A\u767D\u5904\u5E73\u79FB\uFF0C\u6EDA\u8F6E\u7F29\u653E\u3002" })
  ] });
}

// src/client/views/Settings.tsx
var import_react6 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function SettingsView({ courseId, revision, notify, onChanged, onDeleted }) {
  const { data } = useResource(() => api.getCourse(courseId), [courseId, revision]);
  const health = useResource(() => api.health(), []);
  const [form, setForm] = (0, import_react6.useState)({ name: "", subject: "", goal: "", level: "unknown", dailyMinutes: 45, examDate: "", notes: "" });
  const [saving, setSaving] = (0, import_react6.useState)(false);
  const [confirmDelete, setConfirmDelete] = (0, import_react6.useState)(false);
  const [analyzing, setAnalyzing] = (0, import_react6.useState)(false);
  (0, import_react6.useEffect)(() => {
    if (!data?.course) return;
    setForm({
      name: data.course.name ?? "",
      subject: data.course.subject ?? "",
      goal: data.profile?.goal ?? data.course.goal ?? "",
      level: data.profile?.level ?? "unknown",
      dailyMinutes: data.profile?.dailyMinutes ?? 45,
      examDate: data.profile?.examDate ?? "",
      notes: data.profile?.notes ?? ""
    });
  }, [data?.course?.id, data?.updatedAt]);
  const save = async () => {
    setSaving(true);
    try {
      await api.updateCourse(courseId, {
        name: form.name,
        subject: form.subject,
        goal: form.goal,
        level: form.level,
        dailyMinutes: Number(form.dailyMinutes) || 45,
        examDate: form.examDate,
        notes: form.notes
      });
      notify("\u8BB0\u4E0B\u4E86");
      onChanged();
    } catch (error) {
      notify(error?.message ?? "\u4FDD\u5B58\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };
  const reanalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await api.analyze(courseId);
      notify(`\u5DF2\u91CD\u65B0\u5206\u6790\uFF1A${result.chapters ?? 0} \u7AE0\u8282\u3001${result.concepts ?? 0} \u6982\u5FF5`);
      onChanged();
    } catch (error) {
      notify(error?.message ?? "\u5206\u6790\u5931\u8D25");
    } finally {
      setAnalyzing(false);
    }
  };
  const remove = async () => {
    try {
      await api.deleteCourse(courseId);
      notify("\u8BFE\u7A0B\u5DF2\u5220\u9664");
      setConfirmDelete(false);
      onDeleted();
    } catch (error) {
      notify(error?.message ?? "\u5220\u9664\u5931\u8D25");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "eg-grid", style: { gap: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Section, { title: "\u8BFE\u7A0B\u4FE1\u606F", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "eg-grid cols-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u8BFE\u7A0B\u540D\u79F0", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { className: "eg-input", value: form.name, onChange: (event) => setForm({ ...form, name: event.target.value }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u5B66\u79D1", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { className: "eg-input", value: form.subject, onChange: (event) => setForm({ ...form, subject: event.target.value }) }) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Section, { title: "\u4F60\u7684\u5B66\u4E60\u60C5\u51B5", hint: "\u8FD9\u4E9B\u4F1A\u5F71\u54CD\u8BB2\u89E3\u6DF1\u5EA6\u548C\u8BA1\u5212\u8282\u594F", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u5B66\u4E60\u76EE\u6807", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "textarea",
        {
          className: "eg-textarea",
          style: { minHeight: 64 },
          value: form.goal,
          onChange: (event) => setForm({ ...form, goal: event.target.value })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "eg-grid cols-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u57FA\u7840\u6C34\u5E73", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("select", { className: "eg-select", value: form.level, onChange: (event) => setForm({ ...form, level: event.target.value }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "unknown", children: "\u672A\u8BF4\u660E" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "beginner", children: "\u96F6\u57FA\u7840" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "intermediate", children: "\u6709\u4E9B\u57FA\u7840" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "advanced", children: "\u8F83\u719F\u7EC3" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u6BCF\u5929\u5B66\u4E60\u5206\u949F", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            className: "eg-input",
            type: "number",
            min: 10,
            max: 480,
            value: form.dailyMinutes,
            onChange: (event) => setForm({ ...form, dailyMinutes: Number(event.target.value) })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u8003\u8BD5 / \u622A\u6B62\u65E5\u671F", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            className: "eg-input",
            type: "date",
            value: form.examDate,
            onChange: (event) => setForm({ ...form, examDate: event.target.value })
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Field, { label: "\u5176\u5B83\u8BF4\u660E", hint: "\u4F8B\u5982\uFF1A\u53EA\u80FD\u665A\u4E0A\u5B66\u3001\u5E0C\u671B\u591A\u505A\u8BA1\u7B97\u9898\u3001\u9700\u8981\u82F1\u6587\u672F\u8BED\u5BF9\u7167\u3002", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "textarea",
        {
          className: "eg-textarea",
          style: { minHeight: 56 },
          value: form.notes,
          onChange: (event) => setForm({ ...form, notes: event.target.value })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "eg-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { variant: "primary", loading: saving, onClick: save, children: "\u4FDD\u5B58\u8BBE\u7F6E" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Button, { onClick: reanalyze, loading: analyzing, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, { name: "refresh", size: 13 }),
          "\u91CD\u65B0\u5206\u6790\u8D44\u6599"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Section, { title: "\u4E1C\u897F\u5B58\u5728\u54EA", hint: "\u8BFE\u7A0B\u3001\u7B54\u9898\u3001\u590D\u4E60\u8BB0\u5F55\u90FD\u5728\u4F60\u81EA\u5DF1\u7535\u8111\u4E0A\uFF0C\u4E0D\u4E0A\u4F20", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "eg-muted eg-mono", style: { wordBreak: "break-all" }, children: health.data?.storage ?? "\uFF08\u670D\u52A1\u672A\u5C31\u7EEA\uFF09" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Section, { title: "\u60F3\u91CD\u6765", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "eg-row between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "eg-list-title", children: "\u5220\u6389\u8FD9\u95E8\u8BFE" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "eg-muted", children: "\u7AE0\u8282\u3001\u77E5\u8BC6\u70B9\u3001\u8BA1\u5212\u548C\u7B54\u9898\u8BB0\u5F55\u4F1A\u4E00\u8D77\u6E05\u7A7A\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Button, { variant: "danger", onClick: () => setConfirmDelete(true), children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, { name: "trash", size: 13 }),
        "\u5220\u6389\u8BFE\u7A0B"
      ] })
    ] }) }),
    confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      Modal,
      {
        title: "\u771F\u8981\u5220\u6389\u8FD9\u95E8\u8BFE\uFF1F",
        onClose: () => setConfirmDelete(false),
        footer: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { onClick: () => setConfirmDelete(false), children: "\u53D6\u6D88" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { variant: "danger", onClick: remove, children: "\u5220\u6389" })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          "\u5220\u6389\u300C",
          form.name,
          "\u300D\u4E4B\u540E\u627E\u4E0D\u56DE\u6765\u4E86\u3002"
        ] })
      }
    ) : null
  ] });
}

// src/client/views/Chat.tsx
var import_react7 = require("react");

// src/client/embed.ts
var EMBED_HASH = "eg-chat-embed";
var STYLE_ID = "edugraph-chat-embed-style";
function chatFrameUrl(sessionId) {
  if (typeof window === "undefined") return "#";
  const location = window.location;
  const base = location.origin && location.origin !== "null" ? location.origin + location.pathname : location.href.split("#")[0];
  return base + "#" + EMBED_HASH + (sessionId ? "|" + encodeURIComponent(sessionId) : "");
}
function parentTargetOrigin() {
  if (typeof window === "undefined") return "*";
  const origin = window.location?.origin;
  return origin && origin !== "null" ? origin : "*";
}
function readHash() {
  if (typeof window === "undefined" || !window.location) return { embed: false, sessionId: null };
  const hash = String(window.location.hash || "").replace(/^#/, "");
  if (!hash.startsWith(EMBED_HASH)) return { embed: false, sessionId: null };
  const rest = hash.slice(EMBED_HASH.length).replace(/^\|/, "");
  let sessionId = null;
  if (rest) {
    try {
      sessionId = decodeURIComponent(rest);
    } catch {
      sessionId = rest;
    }
  }
  return { embed: true, sessionId };
}
var EMBED_CSS = `
html[data-edugraph-embed] {
  --dsh-windows-titlebar-height: 0px !important;
  --dsh-frame-top-clearance: 0px !important;
  --dsh-windows-content-radius: 0px !important;
}
html[data-edugraph-embed] body { background: transparent !important; }
html[data-edugraph-embed] .mP3x-q_frame {
  grid-template-columns: 0 minmax(0, 1fr) 0 !important;
  padding-top: 0 !important;
  border-radius: 0 !important;
}
html[data-edugraph-embed] .mP3x-q_frame::before,
html[data-edugraph-embed] .mP3x-q_sidebarCol,
html[data-edugraph-embed] .mP3x-q_bottomRow,
html[data-edugraph-embed] [data-shell-bottom],
html[data-edugraph-embed] [data-shell-leading],
html[data-edugraph-embed] [data-sidebar-mask] { display: none !important; }
html[data-edugraph-embed] header[data-window-drag] { display: none !important; }
html[data-edugraph-embed] .mP3x-q_centerCol,
html[data-edugraph-embed] .mP3x-q_mainPanel {
  border-radius: 0 !important;
  background: var(--dsw-alias-bg-base) !important;
}
html[data-edugraph-embed] .an3WzG_composerStack { padding-bottom: 2px !important; }
html[data-edugraph-embed] ::-webkit-scrollbar { width: 8px; height: 8px; }
html[data-edugraph-embed] ::-webkit-scrollbar-track { background: transparent; }
html[data-edugraph-embed] ::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 28%, transparent);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: content-box;
}
html[data-edugraph-embed] ::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 45%, transparent);
}
`;
function installStyle() {
  try {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = EMBED_CSS;
    document.head.append(style);
  } catch {
  }
}
function announceReady() {
  try {
    if (window.parent === window) return;
    let tries = 0;
    const tick = () => {
      tries += 1;
      const composer = document.querySelector('[data-composer-input="true"]');
      if (composer || tries > 80) {
        try {
          window.parent.postMessage({ type: "edugraph:chat-ready" }, parentTargetOrigin());
        } catch {
        }
        return;
      }
      window.setTimeout(tick, 250);
    };
    window.setTimeout(tick, 300);
  } catch {
  }
}
function openRequestedSession(ctx, sessionId) {
  if (!sessionId) return;
  let tries = 0;
  const tick = () => {
    tries += 1;
    try {
      const sessions = ctx?.get?.("sessions");
      const workspace = ctx?.get?.("uiWorkspace");
      const list = sessions?.list?.getSnapshot?.();
      if (sessions && workspace && list?.phase === "ready") {
        const current = Object.values(list.byId ?? {}).find((row) => (row?.retainedBy?.mainView ?? 0) > 0);
        if (current?.id === sessionId) return;
        try {
          workspace.openSession(sessionId);
          return;
        } catch {
        }
      }
    } catch {
    }
    if (tries < 60) window.setTimeout(tick, 400);
  };
  window.setTimeout(tick, 600);
}
var ASK_BRIDGE_FLAG = "__edugraphAskBridge";
function installAskBridge(ctx, hintSessionId) {
  if (typeof window === "undefined" || window.parent === window) return;
  if (window[ASK_BRIDGE_FLAG]) return;
  window[ASK_BRIDGE_FLAG] = true;
  const targetOrigin = parentTargetOrigin();
  const post = (payload) => {
    try {
      window.parent.postMessage(payload, targetOrigin);
    } catch {
    }
  };
  const resolveConversation = async () => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        const sessions = ctx?.get?.("sessions");
        if (sessions) {
          const list = sessions.list?.getSnapshot?.();
          const current = Object.values(list?.byId ?? {}).find((row) => (row?.retainedBy?.mainView ?? 0) > 0)?.id || hintSessionId;
          if (current) {
            const scope = sessions.scope?.(current);
            const conversation = scope?.get?.("conversation");
            if (conversation?.send) return conversation;
          }
        }
      } catch {
      }
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    }
    return null;
  };
  window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    const data = event.data;
    if (data?.type !== "edugraph:ask") return;
    const text = typeof data.text === "string" ? data.text.trim().slice(0, 4e3) : "";
    if (!text) {
      post({ type: "edugraph:ask-error", id: data.id, message: "\u95EE\u9898\u5185\u5BB9\u4E3A\u7A7A" });
      return;
    }
    try {
      const conversation = await resolveConversation();
      if (!conversation) throw new Error("\u4F1A\u8BDD\u8FD8\u6CA1\u6709\u51C6\u5907\u597D");
      await conversation.send(text);
      post({ type: "edugraph:ask-sent", id: data.id });
    } catch (error) {
      console.warn("[edugraph] ask bridge failed", error);
      post({ type: "edugraph:ask-error", id: data.id, message: error?.message ? String(error.message) : String(error) });
    }
  });
}
function installChatEmbed(ctx) {
  const { embed, sessionId } = readHash();
  if (!embed) return false;
  try {
    document.documentElement.setAttribute("data-edugraph-embed", "chat");
  } catch {
  }
  installStyle();
  try {
    ctx?.layout?.selectPanel?.(null);
  } catch {
  }
  installAskBridge(ctx, sessionId);
  announceReady();
  openRequestedSession(ctx, sessionId);
  return true;
}

// src/client/views/Chat.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function postOrigin() {
  const origin = window.location.origin;
  return origin && origin !== "null" ? origin : "*";
}
function ChatDock({ open, sessionId, askRequest, onAskDone, onNotify, onClose, onExpand }) {
  const [mounted, setMounted] = (0, import_react7.useState)(open);
  const [nonce, setNonce] = (0, import_react7.useState)(0);
  const [status, setStatus] = (0, import_react7.useState)("loading");
  const frameRef = (0, import_react7.useRef)(null);
  const postedAsk = (0, import_react7.useRef)(null);
  const src = (0, import_react7.useMemo)(() => chatFrameUrl(sessionId), [sessionId]);
  (0, import_react7.useEffect)(() => {
    if (open) setMounted(true);
  }, [open]);
  (0, import_react7.useEffect)(() => {
    if (!mounted) return void 0;
    setStatus("loading");
    const slow = window.setTimeout(() => {
      setStatus((current) => current === "loading" ? "slow" : current);
    }, 12e3);
    return () => window.clearTimeout(slow);
  }, [mounted, nonce, sessionId]);
  (0, import_react7.useEffect)(() => {
    if (!askRequest || status !== "ready") return void 0;
    if (postedAsk.current === askRequest.id) return void 0;
    const target = frameRef.current?.contentWindow;
    if (!target) {
      onNotify("\u5BFC\u5E08\u9762\u677F\u8FD8\u6CA1\u51C6\u5907\u597D\uFF0C\u7A0D\u540E\u518D\u70B9\u4E00\u6B21");
      onAskDone(askRequest.id);
      return void 0;
    }
    postedAsk.current = askRequest.id;
    try {
      target.postMessage({ type: "edugraph:ask", id: askRequest.id, text: askRequest.text }, postOrigin());
    } catch {
      onNotify("\u95EE\u9898\u6CA1\u6709\u53D1\u51FA\u53BB\uFF0C\u518D\u70B9\u4E00\u6B21\u8BD5\u8BD5");
      onAskDone(askRequest.id);
      return void 0;
    }
    const timer = window.setTimeout(() => {
      if (postedAsk.current === askRequest.id) {
        onNotify("\u5BFC\u5E08\u6CA1\u6709\u56DE\u5E94\uFF0C\u53EF\u80FD\u8FD8\u5728\u63A5\u5165\uFF1B\u7A0D\u540E\u518D\u70B9\u4E00\u6B21");
        onAskDone(askRequest.id);
      }
    }, 8e3);
    return () => window.clearTimeout(timer);
  }, [askRequest, status, onAskDone, onNotify]);
  (0, import_react7.useEffect)(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const frameWindow = frameRef.current?.contentWindow;
      if (frameWindow && event.source !== frameWindow) return;
      const data = event.data;
      if (data?.type === "edugraph:chat-ready") setStatus("ready");
      if (data?.type === "edugraph:chat-failed") setStatus("error");
      if (data?.type === "edugraph:ask-sent" && typeof data.id === "number") onAskDone(data.id);
      if (data?.type === "edugraph:ask-error") {
        console.warn("[edugraph] ask error", data);
        onNotify("\u5BFC\u5E08\u6CA1\u6709\u6536\u5230\u95EE\u9898\uFF1A" + (data.message || "\u672A\u77E5\u9519\u8BEF"));
        if (typeof data.id === "number") onAskDone(data.id);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onAskDone, onNotify]);
  const reload = () => {
    postedAsk.current = null;
    setStatus("loading");
    setNonce((value) => value + 1);
  };
  if (!mounted) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("aside", { className: "eg-chat", "data-state": status, "aria-label": "AI \u5BFC\u5E08", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("header", { className: "eg-chat-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-chat-avatar", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "spark", size: 17 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: "AI \u5BFC\u5E08" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: "eg-live-dot", "data-tone": status === "error" ? "error" : status === "ready" ? "success" : "warn" }),
          status === "ready" ? "\u4E0E\u5F53\u524D\u5BF9\u8BDD\u540C\u6B65" : status === "error" ? "\u8FDE\u63A5\u5931\u8D25\uFF0C\u70B9\u5237\u65B0\u91CD\u8BD5" : status === "slow" ? "\u8FD8\u5728\u8FDE\u63A5\u5BF9\u8BDD\u2026" : "\u6B63\u5728\u63A5\u5165\u5BF9\u8BDD\u2026"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "eg-icon-btn sm", title: "\u91CD\u65B0\u52A0\u8F7D\u5BF9\u8BDD", "aria-label": "\u91CD\u65B0\u52A0\u8F7D\u5BF9\u8BDD", onClick: reload, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "refresh", size: 14 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "eg-icon-btn sm", title: "\u5728\u5B8C\u6574\u5BF9\u8BDD\u4E2D\u6253\u5F00", "aria-label": "\u5728\u5B8C\u6574\u5BF9\u8BDD\u4E2D\u6253\u5F00", onClick: onExpand, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "panel", size: 14 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "eg-icon-btn sm", title: "\u6536\u8D77\u5BFC\u5E08\uFF08\u5BF9\u8BDD\u4E0D\u4E2D\u65AD\uFF09", "aria-label": "\u6536\u8D77\u5BFC\u5E08", onClick: onClose, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "close", size: 14 }) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "eg-chat-body", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-frame-wrap", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "iframe",
        {
          ref: frameRef,
          className: "eg-chat-frame",
          title: "AI \u5BFC\u5E08\u5BF9\u8BDD",
          src,
          onError: () => setStatus("error")
        },
        nonce
      ),
      status !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-cover", "data-slow": status === "slow" || status === "error", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-skeleton", "aria-hidden": "true", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-skel-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "42%" } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "64%" } })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-skel-bubble", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "78%" } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "54%" } })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "eg-chat-skel-row end", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "38%" } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-skel-bubble", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "70%" } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "80%" } }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-skel", style: { width: "46%" } })
          ] })
        ] }),
        status === "slow" || status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-chat-slow", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: status === "error" ? "\u5BF9\u8BDD\u6CA1\u6709\u8FDE\u4E0A" : "\u5BF9\u8BDD\u8FD8\u5728\u52A0\u8F7D" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "\u53EF\u4EE5\u76F4\u63A5\u56DE\u5B8C\u6574\u5BF9\u8BDD\u91CC\u7EE7\u7EED\uFF0C\u5B66\u4E60\u8FDB\u5EA6\u4E0D\u4F1A\u4E22\u3002" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "eg-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "eg-btn sm", onClick: reload, children: "\u91CD\u8BD5" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "eg-btn primary sm", onClick: onExpand, children: "\u56DE\u5230\u5B8C\u6574\u5BF9\u8BDD" })
          ] })
        ] }) : null
      ] }) : null
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("footer", { className: "eg-chat-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "eg-chat-sync", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: "eg-live-dot" }),
        sessionId ? "\u5F53\u524D\u8BFE\u7A0B\u4E0E\u5BF9\u8BDD\u5DF2\u5171\u4EAB" : "\u5148\u5728\u5DE6\u4FA7\u9009\u4E00\u95E8\u8BFE"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "eg-chat-hint", children: "Enter \u53D1\u9001 \xB7 Shift + Enter \u6362\u884C" })
    ] })
  ] });
}

// src/client/session.ts
var KEY = "edugraph.chat.session";
var listeners = /* @__PURE__ */ new Set();
var last = null;
try {
  if (typeof localStorage !== "undefined") last = localStorage.getItem(KEY);
} catch {
  last = null;
}
function getChatSessionId() {
  return last;
}
function subscribeChatSession(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function remember(sessionId) {
  if (!sessionId || sessionId === last) return;
  last = sessionId;
  try {
    localStorage.setItem(KEY, sessionId);
  } catch {
  }
  for (const listener of listeners) {
    try {
      listener();
    } catch {
    }
  }
}
function trackChatSession(ctx) {
  const attach = (scope) => {
    const sessions = scope?.sessions ?? scope?.get?.("sessions");
    if (!sessions?.list?.subscribe) return void 0;
    const update = () => {
      try {
        const state = sessions.list.getSnapshot();
        const row = Object.values(state?.byId ?? {}).find((item) => (item?.retainedBy?.mainView ?? 0) > 0);
        if (row?.id) remember(String(row.id));
      } catch {
      }
    };
    update();
    return sessions.list.subscribe(update);
  };
  if (typeof ctx?.inject === "function") {
    try {
      ctx.inject(["sessions"], attach);
    } catch {
    }
    return;
  }
  try {
    attach(ctx);
  } catch {
  }
}

// src/client/index.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var name = "edugraph-learning";
var inject = ["slots", "layout"];
var PANEL_ID = "learning";
var NAV = [
  { key: "overview", label: "\u6982\u89C8", icon: "target", group: "\u5B66\u4E60" },
  { key: "documents", label: "\u8D44\u6599", icon: "layers", group: "\u5B66\u4E60" },
  { key: "plan", label: "\u8BA1\u5212", icon: "book", group: "\u5B66\u4E60" },
  { key: "lesson", label: "\u8BB2\u89E3", icon: "spark", group: "\u7EC3\u4E60" },
  { key: "graph", label: "\u56FE\u8C31", icon: "graph", group: "\u7EC3\u4E60" },
  { key: "quiz", label: "\u7EC3\u4E60", icon: "quiz", group: "\u7EC3\u4E60" },
  { key: "mistakes", label: "\u9519\u9898", icon: "flag", group: "\u7EC3\u4E60" },
  { key: "review", label: "\u590D\u4E60", icon: "repeat", group: "\u7EC3\u4E60" }
];
var VIEW_LABEL = {
  library: "\u8BFE\u7A0B\u5E93",
  overview: "\u6982\u89C8",
  documents: "\u8D44\u6599",
  plan: "\u8BA1\u5212",
  graph: "\u56FE\u8C31",
  lesson: "\u8BB2\u89E3",
  quiz: "\u7EC3\u4E60",
  mistakes: "\u9519\u9898",
  review: "\u590D\u4E60",
  settings: "\u8BBE\u7F6E"
};
var CHAT_KEY = "edugraph.chat.open";
function readChatOpen() {
  try {
    const value = localStorage.getItem(CHAT_KEY);
    if (value === "1" || value === "0") return value === "1";
  } catch {
  }
  return typeof window !== "undefined" && window.innerWidth >= 1180;
}
function useChatSession() {
  const [sessionId, setSessionId] = (0, import_react8.useState)(() => getChatSessionId());
  (0, import_react8.useEffect)(() => subscribeChatSession(() => setSessionId(getChatSessionId())), []);
  return sessionId;
}
function LearningPanel({ closePanel, chatEnabled = true }) {
  const [catalog, setCatalog] = (0, import_react8.useState)([]);
  const [courseId, setCourseId] = (0, import_react8.useState)(null);
  const [view, setView] = (0, import_react8.useState)("library");
  const [revision, setRevision] = (0, import_react8.useState)(0);
  const [toast, setToast] = (0, import_react8.useState)(null);
  const [dueCount, setDueCount] = (0, import_react8.useState)(0);
  const [booting, setBooting] = (0, import_react8.useState)(true);
  const [chatOpen, setChatOpen] = (0, import_react8.useState)(readChatOpen);
  const [askRequest, setAskRequest] = (0, import_react8.useState)(null);
  const [quizRequest, setQuizRequest] = (0, import_react8.useState)({ mode: "practice" });
  const toastTimer = (0, import_react8.useRef)(null);
  const styleRef = (0, import_react8.useRef)(null);
  const mainRef = (0, import_react8.useRef)(null);
  const chatSession = useChatSession();
  const notify = (0, import_react8.useCallback)((message) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);
  const refresh = (0, import_react8.useCallback)(() => setRevision((value) => value + 1), []);
  const setChat = (0, import_react8.useCallback)((next) => {
    setChatOpen(next);
    try {
      localStorage.setItem(CHAT_KEY, next ? "1" : "0");
    } catch {
    }
  }, []);
  const askTutor2 = (0, import_react8.useCallback)((text, label) => {
    if (!chatEnabled) return false;
    setChat(true);
    setAskRequest({ id: newAskId(), text, label });
    notify(label ? `\u5DF2\u628A\u300C${label}\u300D\u53D1\u7ED9 AI \u5BFC\u5E08` : "\u5DF2\u628A\u95EE\u9898\u53D1\u7ED9 AI \u5BFC\u5E08");
    return true;
  }, [chatEnabled, notify, setChat]);
  const clearAsk = (0, import_react8.useCallback)((id) => {
    setAskRequest((current) => current && current.id === id ? null : current);
  }, []);
  (0, import_react8.useEffect)(() => setTutorSender(askTutor2), [askTutor2]);
  (0, import_react8.useEffect)(() => {
    const style = document.createElement("style");
    style.dataset.edugraph = "learning";
    style.textContent = styles_default;
    document.head.append(style);
    styleRef.current = style;
    return () => {
      style.remove();
    };
  }, []);
  (0, import_react8.useEffect)(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, state] = await Promise.all([
          api.listCourses(),
          api.getState().catch(() => null)
        ]);
        if (cancelled) return;
        setCatalog(list.courses);
        const saved = state?.state ?? {};
        const savedCourse = list.courses.some((course2) => course2.id === saved.activeCourseId);
        if (savedCourse) {
          setCourseId(saved.activeCourseId);
          const savedView = saved.activeView;
          setView(savedView || "overview");
        } else if (list.courses.length) {
          const fallback = list.lastCourseId && list.courses.some((course2) => course2.id === list.lastCourseId) ? list.lastCourseId : list.courses[0].id;
          setCourseId(fallback);
          setView(list.courses.length === 1 ? "overview" : "library");
        } else {
          setView("library");
        }
      } catch (error) {
        notify(error?.message ?? "\u65E0\u6CD5\u8FDE\u63A5\u5B66\u4E60\u670D\u52A1");
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [notify]);
  (0, import_react8.useEffect)(() => {
    if (booting) return;
    void api.saveState({ enabled: true, activeCourseId: courseId, activeView: view }).catch(() => void 0);
  }, [courseId, view, booting, revision]);
  (0, import_react8.useEffect)(() => {
    if (!courseId) {
      setDueCount(0);
      return;
    }
    let cancelled = false;
    api.reviews(courseId).then((data) => {
      if (!cancelled) setDueCount(data.counts?.due ?? 0);
    }).catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [courseId, revision]);
  (0, import_react8.useEffect)(() => {
    mainRef.current?.scrollTo?.({ top: 0 });
  }, [view, courseId]);
  (0, import_react8.useEffect)(() => {
    if (booting) return void 0;
    let cancelled = false;
    api.listCourses().then((data) => {
      if (!cancelled) setCatalog(data.courses);
    }).catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [revision, booting]);
  const course = (0, import_react8.useMemo)(() => catalog.find((item) => item.id === courseId) ?? null, [catalog, courseId]);
  const openCourse = (0, import_react8.useCallback)((id) => {
    setCourseId(id);
    setView("overview");
    refresh();
  }, [refresh]);
  const openLibrary = (0, import_react8.useCallback)(() => {
    setView("library");
    void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => void 0);
  }, []);
  const startQuiz = (0, import_react8.useCallback)((request2) => {
    setQuizRequest(request2);
    setView("quiz");
  }, []);
  const leave = (0, import_react8.useCallback)(() => {
    void api.saveState({ enabled: false }).catch(() => void 0);
    closePanel?.();
  }, [closePanel]);
  const expandChat = (0, import_react8.useCallback)(() => {
    setChat(false);
    setAskRequest(null);
    leave();
  }, [leave, setChat]);
  const toggleChat = (0, import_react8.useCallback)(() => setChat(!chatOpen), [chatOpen, setChat]);
  if (booting) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-app eg-boot", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-boot-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(BrandMark, { size: 46 }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-boot-title", children: "\u6B63\u5728\u6253\u5F00\u5B66\u4E60\u6A21\u5F0F" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-boot-text", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-spinner" }),
        "\u6B63\u5728\u8BFB\u53D6\u8BFE\u7A0B\u4E0E\u5B66\u4E60\u8BB0\u5F55\u2026"
      ] })
    ] }) });
  }
  const showNav = Boolean(courseId);
  const showChat = Boolean(chatEnabled);
  const dataChat = showChat && chatOpen ? "true" : "false";
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-app", "data-chat": dataChat, "data-course": courseId ? "true" : "false", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-shell", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("aside", { className: "eg-rail", "aria-label": "\u5B66\u4E60\u5BFC\u822A", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "eg-brand eg-brand-button", onClick: openLibrary, title: "\u56DE\u5230\u8BFE\u7A0B\u5E93", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(BrandMark, { size: 40 }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-brand-text", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-brand-name", children: "EduGraph" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-brand-sub", children: "AI \u5B66\u4E60\u6A21\u5F0F" })
          ] })
        ] }),
        course ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-course", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-course-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-rail-course-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "book", size: 16 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-course-text", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-rail-course-name", title: course.name, children: course.name }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-rail-course-sub", children: course.subject || "\u6211\u7684\u8BFE\u7A0B" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "eg-icon-btn sm", title: "\u6253\u5F00\u8BFE\u7A0B\u5E93", onClick: openLibrary, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "layers", size: 14 }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "eg-course-picker", title: "\u5207\u6362\u8BFE\u7A0B", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: "\u5207\u6362\u8BFE\u7A0B" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              "select",
              {
                value: courseId ?? "",
                onChange: (event) => {
                  setCourseId(event.target.value);
                  setView("overview");
                  refresh();
                },
                children: catalog.map((item) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: item.id, children: item.name }, item.id))
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-progress", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ProgressRing, { value: (course.progress ?? 0) / 100, size: 40, stroke: 4, label: "\u6574\u4F53\u5B66\u4E60\u8FDB\u5EA6" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-progress-text", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("b", { children: [
                course.progress ?? 0,
                "%"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: "\u6574\u4F53\u8FDB\u5EA6" })
            ] }),
            dueCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "eg-rail-due", children: [
              dueCount,
              " \u5F85\u590D\u4E60"
            ] }) : null
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-empty", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-rail-empty-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "spark", size: 18 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("b", { children: "\u4ECE\u4E00\u95E8\u8BFE\u5F00\u59CB" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: "\u4F20\u4EFD\u8D44\u6599\uFF0C\u81EA\u52A8\u62C6\u51FA\u7AE0\u8282\u3001\u77E5\u8BC6\u70B9\u548C\u5B66\u4E60\u8BA1\u5212\u3002" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "eg-btn sm", onClick: openLibrary, children: "\u6253\u5F00\u8BFE\u7A0B\u5E93" })
        ] }),
        showNav ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("nav", { className: "eg-nav", "aria-label": "\u5B66\u4E60\u5BFC\u822A", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "eg-nav-item", "data-active": view === "library", onClick: openLibrary, title: "\u8BFE\u7A0B\u5E93", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "layers", size: 15 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-label", children: "\u8BFE\u7A0B\u5E93" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-nav-group", children: "\u5B66\u4E60" }),
          NAV.filter((item) => item.group === "\u5B66\u4E60").map((item) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
            "button",
            {
              type: "button",
              className: "eg-nav-item",
              "data-active": view === item.key,
              onClick: () => setView(item.key),
              title: item.label,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: item.icon, size: 15 }) }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-label", children: item.label })
              ]
            },
            item.key
          )),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-nav-group", children: "\u7EC3\u4E60" }),
          NAV.filter((item) => item.group === "\u7EC3\u4E60").map((item) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
            "button",
            {
              type: "button",
              className: "eg-nav-item",
              "data-active": view === item.key,
              onClick: () => setView(item.key),
              title: item.label,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: item.icon, size: 15 }) }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-label", children: item.label }),
                item.key === "review" && dueCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-badge", children: dueCount }) : null
              ]
            },
            item.key
          ))
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("nav", { className: "eg-nav", "aria-label": "\u5B66\u4E60\u5BFC\u822A", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-nav-group", children: "\u5F00\u59CB" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "eg-nav-item", "data-active": "true", onClick: openLibrary, title: "\u8BFE\u7A0B\u5E93", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "layers", size: 15 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-label", children: "\u8BFE\u7A0B\u5E93" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-nav-hint", children: "\u6253\u5F00\u4E00\u95E8\u8BFE\u540E\uFF0C\u8FD9\u91CC\u4F1A\u51FA\u73B0\u5B66\u4E60\u4E0E\u7EC3\u4E60\u5BFC\u822A\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-foot", children: [
          courseId ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "eg-nav-item", "data-active": view === "settings", onClick: () => setView("settings"), title: "\u5B66\u4E60\u8BBE\u7F6E", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "settings", size: 15 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-label", children: "\u8BBE\u7F6E" })
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "eg-nav-item eg-rail-back", onClick: leave, title: "\u8FD4\u56DE DSH \u539F\u751F\u5BF9\u8BDD", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-icon", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "arrow-left", size: 15 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-nav-label", children: "\u8FD4\u56DE\u5BF9\u8BDD" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-rail-note", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("i", { className: "eg-live-dot" }),
            "\u8BFE\u7A0B\u4E0E\u8BB0\u5F55\u53EA\u4FDD\u5B58\u5728\u672C\u673A"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-stage", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("header", { className: "eg-topbar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-crumbs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-crumb-root", children: "\u5B66\u4E60\u6A21\u5F0F" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "chevron", size: 12, className: "eg-crumb-sep" }),
            course && view !== "library" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("b", { title: course.name, children: course.name }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "chevron", size: 12, className: "eg-crumb-sep" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: VIEW_LABEL[view] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("b", { children: "\u8BFE\u7A0B\u5E93" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-top-actions", children: [
            courseId ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "eg-icon-btn sm eg-settings-compact", title: "\u5B66\u4E60\u8BBE\u7F6E", onClick: () => setView("settings"), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "settings", size: 14 }) }) : null,
            showChat ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
              "button",
              {
                type: "button",
                className: "eg-chat-toggle",
                "data-open": chatOpen,
                onClick: toggleChat,
                title: chatOpen ? "\u6536\u8D77 AI \u5BFC\u5E08" : "\u6253\u5F00 AI \u5BFC\u5E08\uFF0C\u5728\u672C\u9875\u76F4\u63A5\u5BF9\u8BDD",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "chat", size: 15 }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-hide-sm", children: "AI \u5BFC\u5E08" }),
                  !chatOpen ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("i", { className: "eg-live-dot", "data-tone": "success" }) : null
                ]
              }
            ) : null,
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "eg-btn ghost sm eg-back-desktop", onClick: leave, title: "\u8FD4\u56DE DSH \u539F\u751F\u5BF9\u8BDD", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "eg-hide-sm", children: "\u8FD4\u56DE\u5BF9\u8BDD" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "arrow-left", size: 14 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("main", { className: "eg-main", ref: mainRef, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "eg-main-inner", children: [
          view === "library" || !courseId ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            LibraryView,
            {
              catalog,
              onOpen: openCourse,
              onChanged: () => {
                refresh();
                void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => void 0);
              },
              notify
            }
          ) : null,
          courseId && view === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(OverviewView, { courseId, revision, onOpenView: setView, notify }) : null,
          courseId && view === "documents" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(DocumentsView, { courseId, revision, onChanged: refresh, notify }) : null,
          courseId && view === "plan" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(PlanView, { courseId, revision, onChanged: refresh, notify, onStartLesson: () => setView("lesson") }) : null,
          courseId && view === "graph" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(GraphView, { courseId, revision, notify, onPractice: (conceptIds) => startQuiz({ mode: "practice", conceptIds }) }) : null,
          courseId && view === "lesson" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(LessonView, { courseId, revision, onChanged: refresh, notify, onPractice: (request2) => startQuiz(request2) }) : null,
          courseId && view === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(QuizView, { courseId, request: quizRequest, onChanged: refresh, notify, onOpenLesson: () => setView("lesson"), onOpenReview: () => setView("review") }) : null,
          courseId && view === "mistakes" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MistakesView, { courseId, revision, notify, onPractice: (conceptIds) => startQuiz({ mode: "practice", conceptIds }) }) : null,
          courseId && view === "review" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ReviewView, { courseId, revision, notify, onChanged: refresh, onPractice: (conceptIds) => startQuiz({ mode: "review", conceptIds }) }) : null,
          courseId && view === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            SettingsView,
            {
              courseId,
              revision,
              notify,
              onChanged: () => {
                refresh();
                void api.listCourses().then((data) => setCatalog(data.courses)).catch(() => void 0);
              },
              onDeleted: () => {
                setCourseId(null);
                setView("library");
                refresh();
              }
            }
          ) : null
        ] }) })
      ] }),
      showChat ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        ChatDock,
        {
          open: chatOpen,
          sessionId: chatSession,
          askRequest,
          onAskDone: clearAsk,
          onNotify: notify,
          onClose: () => {
            setChat(false);
            setAskRequest(null);
          },
          onExpand: expandChat
        }
      ) : null
    ] }),
    toast ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "eg-toast", role: "status", children: toast }) : null
  ] });
}
function LearningIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "graph", size: 16 });
}
function apply(ctx) {
  try {
    if (installChatEmbed(ctx)) {
      trackChatSession(ctx);
      return;
    }
    trackChatSession(ctx);
    const slots = ctx.slots ?? ctx.get?.("slots");
    const layout = ctx.layout ?? ctx.get?.("layout");
    if (!slots) {
      console.warn("[edugraph] no slots service");
      return;
    }
    ctx.effect(
      () => slots.inject("main", () => slots.register({
        name: "main",
        key: PANEL_ID,
        inject: () => ({
          closePanel: () => {
            layout?.selectPanel?.(null);
          },
          chatEnabled: true
        })
      }, LearningPanel)),
      "edugraph-learning: main panel"
    );
    ctx.effect(
      () => slots.inject("sidebar.panellist", () => slots.register({
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: 40,
        label: () => "\u5B66\u4E60"
      }, LearningIcon)),
      "edugraph-learning: sidebar entry"
    );
  } catch (error) {
    console.error("[edugraph] apply failed", error);
    throw error;
  }
}

    })(module, exports, require);
    return module.exports;
  }
});
