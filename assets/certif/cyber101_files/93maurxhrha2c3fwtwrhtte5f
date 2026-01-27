define("editor-shared/template-registry",[],(function(){}))
define("editor-shared/utils/constants",["exports"],(function(t){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.TYPEAHEAD_TYPES_MAP=t.QUILL_EDITOR_SELECTOR=t.QUILL_CONTAINER_CLASS=t.KEY_UP=t.KEY_RIGHT=t.KEY_LEFT=t.KEY_DOWN=void 0
t.QUILL_CONTAINER_CLASS="editor-content",t.QUILL_EDITOR_SELECTOR=".ql-editor",t.KEY_LEFT="Left",t.KEY_UP="Up",t.KEY_RIGHT="Right",t.KEY_DOWN="Down",t.TYPEAHEAD_TYPES_MAP={MENTION:"mention",HASHTAG:"hashtag"}}))
define("editor-shared/utils/editor-setup",["exports","editor-shared/utils/constants","editor-shared/utils/quill/modules/hashtag","editor-shared/utils/quill/modules/mention","editor-shared/utils/quill/modules/clipboard","quill","editor-shared/utils/quill/quill-keyboard-bindings","editor-shared/utils/quill/utils"],(function(t,e,n,i,s,r,o,a){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.setupQuillEditor=function(t,n,i,s,u,c,d,h,g,f,T,m,p,E,x){const v={enter_keydown_disabled:{key:"enter",handler:()=>!n()}},b={...o.enterKeyBinding,...v},S=t.querySelector(`.${e.QUILL_CONTAINER_CLASS}`),A=new r.default(S,{placeholder:i,scrollingContainer:x,formats:["hashtag","mention","guard","bold"],modules:{mention:{actions:{openTypeahead:h,closeTypeahead:g,triggerUnmentionableToast:f,generateNewWorkflowId:T,fireCustomTexteditorTrackingEvent:m,fireControlInteractionEvent:p},trackingData:E},hashtag:{actions:{openTypeahead:h,closeTypeahead:g,generateNewWorkflowId:T,fireCustomTexteditorTrackingEvent:m,fireControlInteractionEvent:p},trackingData:E},keyboard:{bindings:b},history:{delay:50,maxStack:300}}})
delete A.getModule("keyboard").bindings[l.keys.TAB]
A.clipboard.addMatcher("b,strong",a.removeBoldFormatMatcher)
const y=S.querySelector(e.QUILL_EDITOR_SELECTOR)
y.setAttribute("aria-placeholder",i)
y.setAttribute("data-placeholder",i)
y.setAttribute("aria-label",s)
y.setAttribute("role","textbox")
y.setAttribute("aria-multiline",!0)
y.setAttribute("aria-describedby",u)
y.setAttribute("data-test-ql-editor-contenteditable",!0)
c&&A.on(r.default.events.TEXT_CHANGE,(()=>{c(A.getContents())}))
d&&A.once(r.default.events.TEXT_CHANGE,d)
return A}
r.default.register({"modules/mention":i.default,"modules/hashtag":n.default,"modules/clipboard":s.default})
const l=r.default.import("modules/keyboard")}))
define("editor-shared/utils/quill/blots/hashtag",["exports","quill"],(function(t,e){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
const n=e.default.import("blots/inline")
class i extends n{static create(){const t=super.create(...arguments)
t.setAttribute("data-test-ql-hashtag",!0)
return t}}i.className="ql-hashtag"
i.tagName="strong"
i.blotName="hashtag"
t.default=i}))
define("editor-shared/utils/quill/blots/mention",["exports","quill","editor-shared/utils/quill/mention-utils"],(function(t,e,n){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
const i=e.default.import("blots/inline"),s=e.default.import("blots/cursor"),r={characterData:!0,characterDataOldValue:!0,subtree:!0,childList:!0}
let o=0
class a extends i{constructor(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}
super(...arguments)
this.allowSegmentDeletion=!1
this.textSections=[]
this.originalText=""
e.entityUrn&&(this.entityUrn=e.entityUrn)
if(e.objectUrn){this.objectUrn=e.objectUrn
this.allowSegmentDeletion=(0,n.allowSegmentDeletion)(this.objectUrn)}if(e.originalText){this.textSections=a.getMentionTextSections(e.originalText)
this.originalText=e.originalText
this.cachedDomText=e.originalText}this.observer=new MutationObserver((t=>{this.update(t)}))
this._enableMentionObserver()}static create(t){const e=super.create(...arguments)
e.setAttribute("href","#")
e.setAttribute("data-entity-urn",t.entityUrn)
e.setAttribute("data-guid",t.guid||a.createGuid())
e.setAttribute("data-object-urn",t.objectUrn)
e.setAttribute("data-original-text",t.originalText)
e.setAttribute("spellcheck","false")
e.setAttribute("data-test-ql-mention",!0)
return e}static formats(t){const e={}
e.entityUrn=t.getAttribute("data-entity-urn")||""
e.guid=t.getAttribute("data-guid")||""
e.objectUrn=t.getAttribute("data-object-urn")||""
e.originalText=t.getAttribute("data-original-text")||""
return e}static createGuid(){return o++}static getMentionTextSections(t){const e=/\s+/g,n=[]
let i=0,s=e.exec(t)
for(;s;){const[r]=s,o=t.slice(i,s.index)
o&&n.push({text:o,isSeparator:!1})
n.push({text:r,isSeparator:!0})
i=s.index+r.length
s=e.exec(t)}const r=t.slice(i,t.length)
r&&n.push({text:r,isSeparator:!1})
return n}static joinMentionTextSections(t){return t.map((t=>t.text)).join("")}static getTextIndexOfSection(t,e){const n=t.indexOf(e)
if(-1===n)throw new Error(`Section not found in textSections - section: ${e}, textSections: ${t}`)
return t.slice(0,n).reduce(((t,e)=>t+e.text.length),0)}optimize(){super.optimize(...arguments)
let{next:t,prev:e}=this
if((0,n.nextBlotIsEqualMention)(t,this)){this._disableMentionObserver()
for(;(0,n.nextBlotIsEqualMention)(t,this);){t.moveChildren(this)
t.remove()
t=t.next}this._enableMentionObserver()}else if((0,n.prevBlotIsEqualMention)(e,this)){this._disableMentionObserver()
for(;(0,n.nextBlotIsEqualMention)(t,this);){e.moveChildren(this)
e.remove()
e=e.prev}this._enableMentionObserver()}}update(t){super.update(...arguments)
t.forEach((t=>{if(!t.oldValue||!t.oldValue.includes(s.CONTENTS)){if("childList"===t.type&&t.target.className.includes(a.className)){if([...t.addedNodes].some((t=>t.classList&&t.classList.contains(s.className)))){this.scroll.emitter.emit("mention-will-reload")
return}this.textSections=a.getMentionTextSections(this.domNode.innerText)}if("characterData"===t.type){const n=e.default.find(t.target)
if(!(n&&n.parent instanceof a))return
t.target.length<t.oldValue.length&&this.didRemoveMentionTextOnUpdate(t)
t.target.length>t.oldValue.length&&this.didAddMentionTextOnUpdate(t)
t.target.length===t.oldValue.length&&t.target.data!==t.oldValue&&this.didAddMentionTextOnUpdate(t)}}}))}updateDomText(t){this._disableMentionObserver()
this.children.head.domNode.data=t
this._enableMentionObserver()
this.cachedDomText=t}deleteAt(t,e){if(0!==t||e!==this.length())if(this.cachedDomText.length<this.domNode.innerText.length)this.updateDomText(this.cachedDomText)
else{super.deleteAt(...arguments)
this.removeWordsInRange(t,t+e)}else{this.scroll.emitter.emit("mention-range-will-change",this,0)
super.deleteAt(...arguments)}}_disableMentionObserver(){this.observer.disconnect()}_enableMentionObserver(){this.observer.observe(this.domNode,r)}_shouldRemoveMentionSegment(){const t=a.joinMentionTextSections(this.textSections)
return this.domNode.innerText!==t}didAddMentionTextOnUpdate(t){const e=t.oldValue,i=t.target.textContent,s=i.length-e.length,r=(0,n.getIndexFirstDiff)(e,i),o=a.joinMentionTextSections(this.textSections)
if(0!==r)if(r+s!==this.length())this.scroll.emitter.emit("mention-will-unwrap",this)
else{const t=i.substring(r),n=e+t
if(n===o||n===this.originalText){this.textSections=a.getMentionTextSections(n)
return}this.scroll.emitter.emit("mention-move-text-after",this,t)
this.cachedDomText=this.domNode.innerText}else{const t=i.substring(r,s),n=t+e
if(n===o||n===this.originalText){this.textSections=a.getMentionTextSections(n)
return}this.scroll.emitter.emit("mention-move-text-before",this,t)
this.cachedDomText=this.domNode.innerText}}didRemoveMentionTextOnUpdate(t){if(this._shouldRemoveMentionSegment()){const e=t.oldValue,i=t.target.textContent,s=(0,n.getIndexFirstDiff)(e,i)
this.removeWordsInRange(s,s+1)}}static getSectionsToRevove(t,e,n){const i=new Set
t.forEach(((s,r)=>{const o=a.getTextIndexOfSection(t,s),l=o+s.text.length
if(o<=e&&e<l){i.add(r)
s.isSeparator&&t[r-1]&&i.add(r-1)}if(o<n&&n<=l){i.add(r)
t[r-1]&&i.add(r-1)}e<o&&l<n&&i.add(r)}))
return[...i].sort(((t,e)=>t-e))}removeWordsInRange(t,e){if(this.textSections.length<=2||!this.allowSegmentDeletion){this.scroll.emitter.emit("mention-will-remove",this)
return}const n=a.getSectionsToRevove(this.textSections,t,e)
if(!n.length)return
const i=a.getTextIndexOfSection(this.textSections,this.textSections[n[0]])
this.textSections=this.textSections.filter(((t,e)=>!n.includes(e)))
if(this.textSections.length){this.textSections[0].isSeparator&&this.textSections.shift()
this.textSections[this.textSections.length-1].isSeparator&&this.textSections.pop()}this.updateDomText(a.joinMentionTextSections(this.textSections))
this.scroll.emitter.emit("mention-range-will-change",this,i)}}a.className="ql-mention"
a.tagName="a"
a.blotName="mention"
t.default=a}))
define("editor-shared/utils/quill/delta-model-transformers",["exports","@ember/debug","editor-shared/utils/quill/hashtag-utils"],(function(t,e,n){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.deltaFromTextMentionsObject=function(t){const e={ops:[]},{text:i="",mentions:s=[]}=t,r=function(t,e){const i=(0,n.getHashtagMatchRegex)()
let s=i.exec(t)
const r=[]
for(;s;){const e={}
e.match=(0,n.getHashtagAttributes)(s)
e.type="hashtag"
r.push(e)
s=i.exec(t)}return e.concat(r).sort(((t,e)=>t.match.start-e.match.start))}(i,s)
r.length?r[0].match.start>0&&e.ops.push({insert:i.slice(0,r[0].match.start)}):e.ops.push({insert:i})
r.forEach(((t,n)=>{const s=function(t){var e,n
if("hashtag"===t.type)return{insert:t.match.text,attributes:{hashtag:!0}}
const i=null!==(e=t.entity)&&void 0!==e&&e.entityUrn?null===(n=t.entity)||void 0===n?void 0:n.entityUrn:t.entity
if(i){var s,r
return{insert:t.match.text,attributes:{mention:{entityUrn:i,objectUrn:null!==(s=t.entity)&&void 0!==s&&s.objectUrn?null===(r=t.entity)||void 0===r?void 0:r.objectUrn:i,originalText:t.match.text,text:t.match.text}}}}return null}(t)
e.ops.push(s)
const o=t.match.start+t.match.length,a=r[n+1]
a?a.match.start>o&&e.ops.push({insert:i.slice(o,a.match.start)}):e.ops.push({insert:i.slice(o)})}))
e.ops.push({insert:"\n"})
return e}
t.deltaToTextMentionsObject=function(t,e){let n=0
const i=t.ops.reduce(((t,i)=>{let s=i.insert
t.text+=s
if(i.attributes&&i.attributes.mention){s=e?s:s.trim()
t.mentions.push({match:{start:n,length:s.length,text:s},entity:{entityUrn:i.attributes.mention.entityUrn}})}n+=s.length
return t}),{text:"",mentions:[]})
i.text.endsWith("\n")&&(i.text=i.text.slice(0,-1))
return i}}))
define("editor-shared/utils/quill/formats/guard",["exports","quill"],(function(t,e){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
const n=e.default.import("blots/inline")
class i extends n{static create(){return super.create()}static formats(){return!0}}i.className="ql-guard"
i.blotName="guard"
i.CONTENT="​"
t.default=i}))
define("editor-shared/utils/quill/hashtag-utils",["exports","quill"],(function(t,e){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.createDeltaWithPotentialHashtag=o
t.getHashtagAttributes=s
t.getHashtagMatchRegex=i
t.getValidHashtags=r
t.transformDelta=function(t){let e=new n
t.forEach(((t,i)=>{const{operations:s,previousOperation:r}=function(t,e,n){var i,s,r
const a=e>0&&n[n.length-1]
if(null!==(i=t.attributes)&&void 0!==i&&i.hashtag)return function(t,e){var n,i
const s=o(t)
if(e&&e.attributes&&e.attributes.hashtag){const n=s[0].insert,i=/((?:^|$|[^/&\w]))(([#＃])(?!http|www)([^\u0000-\u007F\x09-\x0D\x20\x85\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]|\w|\\)+)/gi
let r=n.match(i)
if(r&&r[0]===n)return{operations:[{insert:t.insert}]}
const o=e.insert+t.insert
r=o.match(i)
if(r&&r[0]===o){e.insert+=t.insert
return{previousOperation:e}}}else if(e&&!Object.keys(e.attributes||{}).length&&null!==(n=e.insert[e.insert.length-1])&&void 0!==n&&null!==(i=n.match)&&void 0!==i&&i.call(n,/[/&\w]/)){e.insert+=t.insert
return{previousOperation:e}}return{operations:s}}(t,a)
if(null!==(s=t.attributes)&&void 0!==s&&s.mention||null!==(r=t.attributes)&&void 0!==r&&r.guard)return{operations:[t]}
return function(t,e){var n,i
const s=o(t)
if(e&&e.attributes&&e.attributes.hashtag){const[t]=s
if(t.attributes&&t.attributes.hashtag)s[0]={insert:t.insert}
else if(!Object.keys(t.attributes||{}).length){const n=/((?:^|$|[^/&\w]))(([#＃])(?!http|www)([^\u0000-\u007F\x09-\x0D\x20\x85\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]|\w|\\)+)/gi
let i=e.insert
const r=t.insert
let o=0
for(;o<r.length;o++){const t=i+r.slice(o,o+1),e=t.match(n)
if(!e||e[0]!==t)break
i=t}const a=r.slice(o)
a?s[0].insert=a:s.shift()
if(e.insert!==i){e.insert=i
return{operations:s,previousOperation:e}}return{operations:s}}}else if(e&&!e.attributes&&e.insert.length&&null!==(n=e.insert[e.insert.length-1])&&void 0!==n&&null!==(i=n.match)&&void 0!==i&&i.call(n,/[/&\w]/)){e.insert+=s[0].insert
s.shift()
return{previousOperation:e,operations:s}}return{operations:s}}(t,a)}(t,i,e.ops)
r&&(e.ops[e.ops.length-1]=r)
s&&s.length>0&&(e=e.concat(new n(s)))}))
return e}
const n=e.default.import("delta")
function i(){return/((?:^|$|[^/&\w]))(([#＃])(?!http|www)([^\u0000-\u007F\x09-\x0D\x20\x85\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]|\w|\\)+)/gi}function s(t){const[,e,n]=t
return{text:n,start:e?t.index+1:t.index,length:n.length}}function r(t){const e=/((?:^|$|[^/&\w]))(([#＃])(?!http|www)([^\u0000-\u007F\x09-\x0D\x20\x85\xA0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]|\w|\\)+)/gi
let n=e.exec(t)
const i=[]
for(;n;){i.push(s(n))
n=e.exec(t)}return i}function o(t){const e=r(t.insert),n=[],{hashtag:i,...s}=t.attributes||{}
if(0===e.length)n.push({...t,attributes:s})
else{const i=e[e.length-1],r=i.start+i.length===t.insert.length
let o=0
e.forEach((e=>{o<e.start&&n.push({insert:t.insert.slice(o,e.start),attributes:s})
n.push({insert:e.text,attributes:{hashtag:!0}})
o=e.start+e.length}))
r||n.push({insert:t.insert.slice(o)})}return n}}))
define("editor-shared/utils/quill/mention-utils",["exports","quill","global-utils/utils/is-browser","global-utils/utils/urn-converter","editor-shared/utils/quill/utils","editor-shared/utils/quill/blots/mention"],(function(t,e,n,i,s,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.MENTION_QUERY_LENGTH_LIMIT=t.MENTION_DENOTATION_CHARACTERS=t.DEFAULT_TYPEAHEAD_QUERY_NO_TEXT=void 0
t.allowSegmentDeletion=function(t){if(!t)return!1
const{type:e}=(0,i.fromUrn)(t,!1)
return o.includes(e)}
t.didDeleteTriggerCharacter=function(t,e){if(!t||!e)return!1
return e.diff(t).ops.some((t=>t.insert&&u.some((e=>{var n,i
return null===(n=(i=t.insert).includes)||void 0===n?void 0:n.call(i,e)}))))}
t.getIndexFirstDiff=function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:""
if(null!==t&&null!==e&&t!==e){let n=0
for(;t[n]===e[n];)n++
return n}return-1}
t.getMentionDelimiter=c
t.getSearchQuery=function(t,e){const{before:n,current:i,numberOfEmbeds:r}=function(t,e){const n=[]
let i=null,s=0,r=0
t.ops.every((t=>{if("object"==typeof t.insert){r++
s++
return!0}r+=t.insert.length||0
if(r<e){n.push(t)
return!0}i=t
return!1}))
return{before:n,current:i,numberOfEmbeds:s}}(t,e.index)
if(!i)return null
const o=n.reduce(((t,e)=>t+e.insert.length),0)+r,u=c(i,e,o)
if(null===u)return null
const d=u.indexAfterToken-u.token.length
if(d>0&&(0,s.isAlphaNumericCharacter)(i.insert[d-1]))return null
const h=u.indexAfterToken+o,g=e.index-o
if(g===u.indexAfterToken){if(i.insert.slice(u.indexAfterToken).match(/^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/))return{query:i.insert[u.indexAfterToken],queryStartIndex:u.indexAfterToken,queryToken:u.token}
if(!i.insert.slice(u.indexAfterToken).match(/^\w+/))return{query:a,queryStartIndex:h,queryToken:u.token}}let f=i.insert.slice(u.indexAfterToken,g)
const T=i.insert.slice(g).match(/^\w+/)
T&&(f+=T[0])
if(!function(t){return-1===t.indexOf("\n")&&t.length<=l}(f))return null
return{query:f,queryToken:u.token,queryStartIndex:h}}
t.isCharacterWhiteSpace=function(t,e){if(t){return/^\s$/.test(t.charAt(e))}return!1}
t.nextBlotIsEqualMention=function(t,e){return t instanceof r.default&&t.prev===e&&(0,s.isShallowEqualObjects)(e.formats().mention,t.formats().mention)}
t.prevBlotIsEqualMention=function(t,e){return t instanceof r.default&&t.next===e&&(0,s.isShallowEqualObjects)(e.formats().mention,t.formats().mention)}
t.queueSetSelection=d
t.scrubInsertedMentions=function(t){let e=!1
return{scrubbedDelta:{ops:t.ops.map((t=>{if(null!=t&&t.insert&&(null!=(n=null==t?void 0:t.attributes)&&n.mention&&!(n.mention.entityUrn&&n.mention.objectUrn&&n.mention.originalText))){e=!0
return{insert:t.insert}}var n
return t}))},hasChanged:e}}
t.setContents=function(t,n){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.default.sources.API
const s=t.getSelection()
t.setContents(n)
s&&d(t,s.index,i)}
const o=["member","fsd_profile"],a=t.DEFAULT_TYPEAHEAD_QUERY_NO_TEXT="a",l=t.MENTION_QUERY_LENGTH_LIMIT=100,u=t.MENTION_DENOTATION_CHARACTERS=["@","@","＠"]
function c(t,e,n){var i,s
const r=(null===(i=(s=t.insert).slice)||void 0===i?void 0:i.call(s,0,e.index-n))||""
return u.reduce(((t,e)=>{const n=r.lastIndexOf(e)
if(-1===n)return t
const i=n+e.length
return t&&t.indexAfterToken>i?t:{indexAfterToken:i,token:e}}),null)}function d(t){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0
n.default&&window.requestAnimationFrame((()=>{t.setSelection(i,s,e.default.sources.USER)}))}}))
define("editor-shared/utils/quill/modules/clipboard",["exports","quill"],(function(t,e){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
const n=e.default.import("modules/clipboard"),i=e.default.import("delta")
t.default=class extends n{onPaste(t){var e
if(null===(e=t.clipboardData)||void 0===e?void 0:e.getData("text/link-preview")){const e=this.quill.getSelection()
if(!e)return super.onPaste(t)
t.preventDefault()
const n=t.clipboardData.getData("text/plain"),s=(new i).retain(e.index).delete(e.length).insert(n)
this.quill.updateContents(s,"silent")
const r=n.length+e.index,o=0
this.quill.setSelection(r,o,"silent")}return super.onPaste(t)}}}))
define("editor-shared/utils/quill/modules/hashtag",["exports","quill","editor-shared/utils/quill/blots/hashtag","editor-shared/utils/quill/hashtag-utils"],(function(t,e,n,i){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
const s=e.default.import("core/module"),r=e.default.import("delta")
class o extends s{static register(){e.default.register("blots/hashtag",n.default)}constructor(t,e){super(t,e)
this.options={actions:{},trackingData:{},...e}
this.actions=this.options.actions
this.trackingData=this.options.trackingData
this.context=this.options.context
this.attachMatchers()
this.attachEvents()}compositionEnd(){const t=this.quill.getContents()
this.createFormattedHashtags(t)
const e=this.quill.getSelection()
e&&this.detectTypeaheadTrigger(e.index)}attachMatchers(){this.quill.clipboard.addMatcher(...o.matchHashtag())}attachEvents(){this.quill.on("hashtag-unwrap",this.unwrapHashtag.bind(this))
this.quill.on(e.default.events.EDITOR_CHANGE,this.onEditorChange.bind(this))
this.quill.root.addEventListener("compositionend",this.compositionEnd.bind(this))}static matchHashtag(){return[n.default.className,(t,e)=>{const[n]=e.ops
return(new r).insert(n.insert)}]}unwrapHashtag(t){const e=this.quill.getIndex(t),n=t.length()
this.quill.removeFormat(e,n)}onEditorChange(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),s=1;s<n;s++)i[s-1]=arguments[s]
const r=i[2]
if(!this.quill.selection.composing&&t===e.default.events.TEXT_CHANGE&&r===e.default.sources.USER){const t=this.quill.getContents(),e=i[0].ops.some((t=>{var e,n
return t.insert&&(null===(e=(n=t.insert).includes)||void 0===e?void 0:e.call(n,"\n"))&&!t.attributes}))
this.createFormattedHashtags(t,e)}}createFormattedHashtags(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1]
const n=t.diff((0,i.transformDelta)(t.ops))
n.ops.length>0?this.quill.updateContents(n):e&&this.quill.setContents(t)}}t.default=o}))
define("editor-shared/utils/quill/modules/mention",["exports","quill","editor-shared/utils/quill/blots/mention","editor-shared/utils/quill/formats/guard","editor-shared/utils/quill/mention-utils","editor-shared/utils/quill/utils","editor-shared/utils/tracking/mentions-tracking","editor-shared/utils/constants"],(function(t,e,n,i,s,r,o,a){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
const l=e.default.import("core/module"),u=e.default.import("delta"),c=e.default.import("parchment"),d=e.default.import("blots/text")
t.default=class extends l{static register(){e.default.register("blots/mention",n.default)
e.default.register("formats/guard",i.default)}constructor(t,e){super(t,e)
this.range=t.getSelection()
this.options={actions:{openTypeahead:null,closeTypeahead:null,triggerUnmentionableToast:null,generateNewWorkflowId:null,fireCustomTexteditorTrackingEvent:null,fireControlInteractionEvent:null},trackingData:{associatedEntityUrn:null,controlType:null,rootObject:null,trackingId:null}}
Object.assign(this.options,e)
this.actions=this.options.actions
this.trackingData=this.options.trackingData
this.attachEvents()
this.attachMatchers()
this.hasTriggeredTypeahead=!1}attachMatchers(){this.quill.clipboard.addMatcher(...this.matchMention())
this.quill.clipboard.addMatcher(...this.matchTextNode())}attachEvents(){var t=this
this.quill.on("mention-will-reload",this.onMentionWillReload.bind(this))
this.quill.on("mention-move-text-before",this.onMentionMoveTextBefore.bind(this))
this.quill.on("mention-move-text-after",this.onMentionMoveTextAfter.bind(this))
this.quill.on("mention-range-will-change",this.onMentionWillChange.bind(this))
this.quill.on("mention-will-unwrap",this.onMentionWillUnwrap.bind(this))
this.quill.on("mention-will-remove",this.onMentionWillRemove.bind(this))
this.quill.on(e.default.events.TEXT_CHANGE,this.onTextChange.bind(this))
this.quill.on(e.default.events.EDITOR_CHANGE,(function(n){if(n===e.default.events.SELECTION_CHANGE){for(var i=arguments.length,s=new Array(i>1?i-1:0),r=1;r<i;r++)s[r-1]=arguments[r]
t.onSelectionChange(...s)}}))
this.quill.root.addEventListener("compositionstart",this.compositionStart.bind(this))
this.quill.root.addEventListener("compositionend",this.compositionEnd.bind(this))}_setTypeaheadTriggeredValue(t){this.hasTriggeredTypeahead=t}_removeGuards(){const t=this.quill.scroll.descendants(i.default,0,this.quill.getLength()),e=t.length
t.forEach(((t,n)=>{const i=this.quill.getIndex(t)
t.domNode.parentNode.removeChild(t.domNode)
e===n+1&&(0,s.queueSetSelection)(this.quill,i)}))}matchTextNode(){return[3,(t,e)=>{if(!this.range)return e
const n=this.range.index,[i]=this.quill.getLeaf(n),s=i.parent
this.isIndexInsideMention(n,s)&&this.quill.removeFormat(this.quill.getIndex(s),s.length())
return e}]}matchMention(){return[".ql-mention",(t,e)=>{const s=e.ops[0],r=n.default.formats(t)
r.guid=n.default.createGuid()
s.attributes={mention:r}
s.attributes.mention.originalText=s.insert
const o=new u([{insert:i.default.CONTENT,attributes:{guard:!0}}])
return(new u).concat(o).concat(e).concat(o)}]}isIndexInsideMention(t,e){if(e instanceof n.default){const{start:n,end:i}=(0,r.getBlotIndices)(this.quill,e)
return t>n&&t<i}return!1}onMentionMoveTextAfter(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:""
if(!(t.next instanceof d)){const e=c.create("text","")
null==t.next?e.insertInto(t.parent):t.parent.insertBefore(e,t.next)}t.deleteAt(t.length()-e.length,e.length,!0)
t.next.insertAt(0,e)
this.onMentionWillChange(t,t.length()+1)}onMentionWillReload(){(0,s.setContents)(this.quill,this.quill.getContents())}onMentionMoveTextBefore(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:""
if(!(t.prev instanceof d)){const e=c.create("text","")
t.parent.insertBefore(e,t)}t.deleteAt(0,e.length,!0)
t.prev.insertAt(t.prev.length(),e)
this.onMentionWillChange(t,0)}onTextChange(t,e,n){if(this.quill.selection.composing)return
const i=this.quill.getSelection()
null!==i&&(this.range=i)
if(null!=t&&t.ops){const{scrubbedDelta:n,hasChanged:i}=(0,s.scrubInsertedMentions)(this.quill.getContents())
i&&(0,s.setContents)(this.quill,n,"silent")
const r=n||t,o=null==r?void 0:r.ops.some((t=>t.attributes&&t.attributes.mention)),a=this.quill.getContents()
o?this._removeGuards():(0,s.didDeleteTriggerCharacter)(e,a)&&this._setTypeaheadTriggeredValue(!1)}this.willDetectTypeaheadTrigger()}onSelectionChange(t,e,n){null!==t&&(this.range=t)
this.willDetectTypeaheadTrigger()}onMentionWillChange(t,e){const n=this.quill.getIndex(t)+e,i=(0,o.getSearchHeaderForMentionsTrackingEvent)()
this.actions.fireCustomTexteditorTrackingEvent(o.EVENTS.MENTION_ACTION,(0,o.getMentionSuggestionActionEventPayload)(i,o.ACTIONS.PERSONALIZE),a.TYPEAHEAD_TYPES_MAP.MENTION);(0,s.queueSetSelection)(this.quill,n)}onMentionWillRemove(t){const e=this.quill.getIndex(t)
t.remove()
const n=(0,o.getSearchHeaderForMentionsTrackingEvent)()
this.actions.fireCustomTexteditorTrackingEvent(o.EVENTS.MENTION_ACTION,(0,o.getMentionSuggestionActionEventPayload)(n,o.ACTIONS.DELETE),a.TYPEAHEAD_TYPES_MAP.MENTION)
this.currentMentionToken=null;(0,s.queueSetSelection)(this.quill,e)}onMentionWillUnwrap(t){const n=this.range.index
this.quill.removeFormat(this.quill.getIndex(t),t.length())
const i=(0,o.getSearchHeaderForMentionsTrackingEvent)()
this.actions.fireCustomTexteditorTrackingEvent(o.EVENTS.MENTION_ACTION,(0,o.getMentionSuggestionActionEventPayload)(i,o.ACTIONS.DELETE),a.TYPEAHEAD_TYPES_MAP.MENTION)
this.quill.setSelection(n,0,e.default.sources.USER)}compositionStart(){this.actions.closeTypeahead(a.TYPEAHEAD_TYPES_MAP.MENTION)}compositionEnd(){const t=this.quill.getSelection()
if(t){this.range=t
this.willDetectTypeaheadTrigger()}}willDetectTypeaheadTrigger(){if(null==this.range)return
const t=(0,s.getSearchQuery)(this.quill.getContents(),this.range)
if(t){this.actions.openTypeahead({typeaheadQuery:t.query,typeaheadType:a.TYPEAHEAD_TYPES_MAP.MENTION,onTypeaheadSelect:this.insertMention.bind(this,t.queryStartIndex,t.queryToken,t.query.length),onDismissWithoutSelection:this.fireDismissTypeaheadTracking.bind(this)})
if(!this.hasTriggeredTypeahead){this.actions.generateNewWorkflowId()
this.actions.fireControlInteractionEvent(`${this.trackingData.controlType}_mention_start`)
const e=(0,o.getSearchHeaderForMentionsTrackingEvent)(t.query)
this.actions.fireCustomTexteditorTrackingEvent(o.EVENTS.START,(0,o.getMentionSuggestionStartEventPayload)(e,t.queryToken,this.trackingData),a.TYPEAHEAD_TYPES_MAP.MENTION)}this._setTypeaheadTriggeredValue(!0)}else this.actions.closeTypeahead(a.TYPEAHEAD_TYPES_MAP.MENTION)}fireDismissTypeaheadTracking(t){if(t){const e=(0,o.getSearchHeaderForMentionsTrackingEvent)(t)
this.actions.fireCustomTexteditorTrackingEvent(o.EVENTS.MENTION_ACTION,(0,o.getMentionSuggestionActionEventPayload)(e,o.ACTIONS.DISMISS),a.TYPEAHEAD_TYPES_MAP.MENTION)}}insertMention(t,n,r,l,c){const d=t-n.length,h=n.length,g={...l,originalText:l.text},f=this.quill.getText(t,r).trim()||s.DEFAULT_TYPEAHEAD_QUERY_NO_TEXT
let T=0
const m=this.quill.getText(t,g.originalText.length).toLowerCase()
T=r>=g.originalText.length?h+r:m===g.originalText.toLowerCase()?h+g.originalText.length:h+r
delete g.text
let p
if("MENTION_DISABLED_ENTITY"===(null==l?void 0:l.renderStyle)){var E,x
p=(new u).retain(d).delete(T).insert(g.originalText)
null===(E=(x=this.actions).triggerUnmentionableToast)||void 0===E||E.call(x,{name:g.originalText})}else p=(new u).retain(d).delete(T).insert(i.default.CONTENT,{guard:!0}).insert(g.originalText,{mention:g}).insert(i.default.CONTENT,{guard:!0})
this.quill.updateContents(p,e.default.sources.USER)
const v=d+g.originalText.length;(0,s.queueSetSelection)(this.quill,v)
const b=(0,o.getSearchHeaderForMentionsTrackingEvent)(f)
this.actions.fireControlInteractionEvent(`${this.trackingData.controlType}_mention_select`)
this.actions.fireCustomTexteditorTrackingEvent(o.EVENTS.MENTION_ACTION,(0,o.getMentionSuggestionActionSelectEventPayload)(b,g,c),a.TYPEAHEAD_TYPES_MAP.MENTION)
this._setTypeaheadTriggeredValue(!1)
this.actions.closeTypeahead(a.TYPEAHEAD_TYPES_MAP.MENTION)}}}))
define("editor-shared/utils/quill/quill-keyboard-bindings",["exports","quill"],(function(t,e){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.enterKeyBinding=void 0
const n=e.default.import("modules/keyboard")
t.enterKeyBinding={"entity enter":{key:n.keys.ENTER,format:["mention"],handler:function(){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}
const n=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}).index
if(n&&""!==t.prefix&&""!==t.suffix){const[t]=this.quill.getLeaf(n)
this.quill.removeFormat(this.quill.getIndex(t),t.length(),e.default.sources.SILENT)
this.quill.setSelection(n)}return!0}},bold:{key:"B",shortKey:!0,handler:()=>!1}}}))
define("editor-shared/utils/quill/utils",["exports","quill"],(function(t,e){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.getBlotIndices=function(t,e){if(t&&e){const n={}
n.start=t.getIndex(e)
n.end=n.start+e.length()
return n}return}
t.isAlphaNumericCharacter=function(t){if(t)return!!t.match(i)
return!1}
t.isShallowEqualObjects=function(t,e){if(t===e)return!0
if("object"!=typeof t||null==t)return!1
if("object"!=typeof e||null==e)return!1
const n=Object.keys(t)
if(n.length!==Object.keys(e).length)return!1
return n.every((n=>t[n]===e[n]))}
t.normalizeTypeaheadViewModel=function(){var t,e,n,i,s,r,o
let a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}
return{entityUrn:(null===(t=a.target)||void 0===t||null===(e=t.profile)||void 0===e?void 0:e.entityUrn)||(null===(n=a.target)||void 0===n||null===(i=n.company)||void 0===i?void 0:i.entityUrn)||(null===(s=a.target)||void 0===s||null===(r=s.school)||void 0===r?void 0:r.entityUrn),objectUrn:a.trackingUrn??"",text:(null===(o=a.title.text)||void 0===o?void 0:o.normalize())??"",trackingId:a.trackingId??"",renderStyle:a.renderStyle??""}}
t.removeBoldFormatMatcher=function(t,e){return e.compose((new n).retain(e.length(),{bold:null}))}
t.replaceSelectedText=function(t,e,i){return(new n).retain(e).delete(i).insert(t)}
t.trimLineBreakFromDelta=function(t){const e=t.ops[t.ops.length-1]
e.insert&&e.insert.endsWith("\n")&&(e.insert=e.insert.slice(0,-1))}
const n=e.default.import("delta"),i=/\w/}))
define("editor-shared/utils/text-editor-utils",["exports","editor-shared/utils/constants","editor-shared/utils/quill/mention-utils"],(function(t,e,n){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.getElementDistanceFromTopOfWindow=function(t){let e=0,n=t
for(;n;){e+=n.offsetTop-n.scrollTop+n.clientTop
n=n.offsetParent}return e}
t.getFormattedHashtagResults=function(t){const e=[]
t.forEach(((t,n)=>{if(!t.trackingUrn&&!t.objectUrn)return
const i={entityUrn:t.trackingUrn??t.objectUrn,position:{index:n},trackingId:t.trackingId}
e.push(i)}))
return e}
t.getFormattedMentionsResults=function(t){const e=[]
t.forEach(((t,n)=>{if(!t.trackingUrn&&!t.objectUrn)return
const i={entityUrn:t.trackingUrn??t.objectUrn,position:{index:n},isCacheHit:!1}
e.push(i)}))
return e}
t.isValidTypeaheadType=function(t){return Object.values(e.TYPEAHEAD_TYPES_MAP).includes(t)}
t.mentionQueryMatchesRecommendedMention=function(t,e){if(e===n.DEFAULT_TYPEAHEAD_QUERY_NO_TEXT)return!0
const i=e.toLowerCase()
return t.toLowerCase().startsWith(i)}}))
define("editor-shared/utils/tracking/mentions-tracking",["exports"],(function(t){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.EVENTS=t.ACTIONS=void 0
t.getMentionSuggestionActionEventPayload=function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null
return{searchHeader:t,actionType:e,result:n}}
t.getMentionSuggestionActionSelectEventPayload=function(t,n,i){return{searchHeader:t,actionType:e.SELECT,result:{entityUrn:n.objectUrn,position:{index:i}}}}
t.getMentionSuggestionStartEventPayload=function(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{}
const i=n.objectUrn&&n.trackingId?{objectUrn:n.objectUrn,trackingId:n.trackingId}:null
return{searchHeader:t,associatedInputControlUrn:`${n.controlType}_mention_start`,associatedEntityUrn:null!=n&&n.associatedEntityUrn?n.associatedEntityUrn:null,rootObject:i,mentionType:"EXPLICIT",mentionStartOperator:e}}
t.getSearchHeaderForMentionsTrackingEvent=function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:""
return{query:t,platform:"TYPEAHEAD",vertical:"PEOPLE"}}
t.EVENTS={START:"MentionSuggestionStartEvent",VIEW_LIST:"MentionSuggestionImpressionEvent",MENTION_ACTION:"MentionSuggestionActionEvent",RESULT_IMPRESSION:"MentionResultHit"}
const e=t.ACTIONS={SELECT:"SELECT",DELETE:"DELETE",DISMISS:"DISMISS",PERSONALIZE:"PERSONALIZE"}}))
define("editor-shared/utils/tracking/texteditor-tracking",["exports","editor-shared/utils/constants","ember-cli-pemberly-tracking/utils/uuid"],(function(t,e,n){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
t.default=void 0
t.default=class{constructor(t,e){this.trackingService=t
this.workflowId=e
this.typeaheadSearchId=n.default.v4()}fireTrackingEvent(t,n,i){n.searchHeader&&(n.searchHeader.rawSearchId=this.typeaheadSearchId)
switch(i){case e.TYPEAHEAD_TYPES_MAP.MENTION:n.mentionWorkflowId=this.workflowId
this.trackingService.fireTrackingPayload(t,n)
break
case e.TYPEAHEAD_TYPES_MAP.HASHTAG:n.hashtagWorkflowId=this.workflowId
this.trackingService.fireTrackingPayload(t,n)}}}}))

//# sourceMappingURL=engine-vendor.map