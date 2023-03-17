class t{constructor(){this.handlers={}}addHandler(t,e){const s=this.handlers;s[t]=s[t]||[],s[t].push(e)}removeHandler(t,e){const s=this.handlers[t];s&&e&&s.splice(s.indexOf(e),1)}emit(t,e){const s=this.handlers[t];s&&s.forEach((t=>{try{t(e)}catch(t){}}))}}function e(t){const e=document.createElement("div");return e.innerHTML=t.trim(),e.firstChild}function s(t,e,s){return t.addEventListener(e,s),function(t,e,s){return()=>t.removeEventListener(e,s)}(t,e,s)}function i(t,e,s){t.removeEventListener(e,s)}function n(t){t.parentNode&&t.parentElement.removeChild(t)}const l="ced",o=`${l}-grid-container`,r=`${l}-grid-container-scroll`,c=`${l}-grid`,h=`${l}-row`,a=`${l}-cell`,d=`${l}-select-cell`,u=`${l}-head`,p=`${l}-head-sticky`,m=`${l}-resizer`,v=`${l}-editing`,f=`${l}-active`,w=`${l}-selected`,C=`${l}-readonly`;class y{constructor(t,e,s){this.row=t,this.col=e,this.readonly=!1,this.isActive=!1,this.isSelected=!1,this.extraCss="",x(s)?this.val=String(s):(this.readonly=s.readonly,this.val=String(s.value),this.extraCss=s.css)}destroy(){}element(){if(!this.elem){const t=document.createElement("div");t.appendChild(g(this.val)),t.setAttribute("data-ci",String(this.col)),this.elem=t,this.setCss()}return this.elem}selected(){return this.isSelected}select(t=!0){return this.isSelected=t,this.setCss(),this}activate(t=!0){return t?this.isActive=this.isSelected=!0:(this.isActive=!1,this.input&&(this.input.blur(),n(this.input),this.elem.innerHTML="",this.elem.appendChild(g(this.input.value)),this.input=null)),this.setCss(),this}value(){return this.input?this.input.value:this.val}set(t){x(t)?this.setValue(t):(S(t.value)&&this.setValue(t.value),this.readonly=S(t.readonly)?t.readonly:this.readonly,this.extraCss=t.css,this.setCss())}setValue(t){this.val=String(t),this.input?this.input.value=t.toString():this.elem&&(this.elem.innerHTML="",this.elem.appendChild(g(t)))}setCss(){const t=a+A(this.readonly,C)+A(this.isActive,f)+A(this.isSelected,w)+A(!!this.input,v)+A(!!this.extraCss,this.extraCss);this.elem&&(this.elem.className=t)}startEdit(t,e=!1){if(this.readonly)return;const s=this.elem;this.input=t,t.value=s.textContent,e&&t.select(),t.style.width=s.offsetWidth-2+"px",s.innerHTML="",s.appendChild(t),t.focus(),this.setCss()}takesKey(){return!!this.input}takesMouse(){return this.takesKey()}}function g(t){const e=document.createElement("span");return e.appendChild(document.createTextNode(String(t))),e}class E{constructor(t,s,i,n){this.row=t,this.col=s,this.readonly=!1,this.options=null,this.isSelected=!1,this.extraCss="",this.readonly=i.readonly,this.options=i.options,this.elem=e(`<div data-ci="${s}"></div>`),this.selectElement=e("<select><select>"),function(t,e){for(let e=t.options.length;e>0;e--)t.remove(e);for(const s of e){const e=document.createElement("option");e.value=""+s,e.innerHTML=""+s,t.appendChild(e)}}(this.selectElement,this.options),this.set(""+i.value),this.elem.appendChild(this.selectElement),this.listener=()=>n(this),this.selectElement.addEventListener("change",this.listener),this.extraCss=i.css,this.setCss()}destroy(){this.selectElement.removeEventListener("change",this.listener),this.listener=null}element(){return this.elem}value(){return this.selectElement.value}set(t){x(t)?this.setValue(t):(S(t.value)&&this.setValue(t.value),this.extraCss=t.css,this.setCss())}setValue(t){this.selectElement.value=t?t.toString():null}setCss(){const t=a+" "+d+A(this.readonly,C)+A(this.isSelected,w)+A(!!this.extraCss,this.extraCss);this.elem.className=t}select(t=!0){return this.isSelected=t,this.setCss(),this}selected(){return this.isSelected}activate(t){return this}startEdit(t,e){}takesKey(){return!1}takesMouse(){return!0}}function x(t){return"string"==typeof t||"number"==typeof t}function S(t){return void 0!==t}function A(t,e){return t?" "+e:""}class b{constructor(t){this.cells=[],this.index=t.index,this.cells=t.cells.map(((e,s)=>{return i=this.index,n=s,l=e,o=t.updateValueCallback,"string"!=typeof l&&"number"!=typeof l&&Array.isArray(l.options)?new E(i,n,l,o):new y(i,n,l);var i,n,l,o}))}element(){if(!this.elem){const t=document.createElement("div");t.setAttribute("data-ri",String(this.index)),t.className=h,this.elem=t,this.cells.forEach((t=>this.elem.appendChild(t.element())))}return this.elem}}class ${constructor(t){this.options=t}rerender(t){const{grid:e,head:s}=this.options;e.innerHTML="",e.appendChild(s),t.forEach((t=>{e.appendChild(t.element())}))}destroy(){this.options=null}}class H{constructor(t){this.options=t}rerender(t){const{grid:e,head:s,container:i,gridContainer:n}=this.options;this.onScroll&&i.removeEventListener("scroll",this.onScroll);const l={viewportHeight:void 0,itemCount:void 0,start:void 0,end:void 0};let o=34;e.style.position="absolute";const r=r=>{const c=t.length,h=i.offsetHeight,a=c*o;let d=Math.floor(r/o)-4;d%2>0&&(d-=1),d=Math.max(0,d);let u=Math.ceil(h/o)+8;u=Math.min(c-d,u);const p=d+u-1,m=Math.max(0,a-h-4*o),v=Math.min(m,d*o),f=c-1,w=l.end===f&&p===f,C=l.start!==d||l.end!==p,y=h!==l.viewportHeight;if(c!==l.itemCount||y||C&&!w){const i=u*o;l.start=d,l.end=p,l.viewportHeight=h,l.itemCount=c,e.innerHTML="",e.appendChild(s);const r=e.offsetHeight;let m=0;const f=document.createDocumentFragment();let w=d;for(;w<=p&&w<t.length;++w){const e=t[w];f.appendChild(e.element())}for(e.appendChild(f),m=e.offsetHeight-r;m<i&&w<t.length;++w){const s=t[w].element();e.appendChild(s),m+=s.offsetHeight}const C=w-d;C&&(o=m/C),n.style.height=`${a}px`,e.style.top=`${v}px`}};let c;this.onScroll=t=>{c&&cancelAnimationFrame(c),c=requestAnimationFrame((()=>{r(t.target.scrollTop)}))},i.addEventListener("scroll",this.onScroll),r(i.scrollTop)}destroy(){this.options.container.removeEventListener("scroll",this.onScroll),this.options=null,this.onScroll=null}}class M{constructor(e,s){var i,n;this.rows=[],this.cells=[],this.events=new t,this.cleanups=[],this.container="string"==typeof e?(i=e,n||(n=i,i=document),i.querySelector(n)):e,s&&this.init(s)}init(t){this.destroy(),t.scroll=function(t){const e=t.scroll;if(!e)return{};return{enabled:I(e.enabled),virtualScroll:I(e.virtualScroll),stickyHeader:I(e.stickyHeader)}}(t),this.options=t;const s=this.container,i=this.rows;s.innerHTML="",i.length=0,t.input?(this.cellInput="function"==typeof t.input?t.input():t.input,n(this.cellInput)):this.cellInput=e('<input id="celled-cell-input" type="text" >'),this.hiddenInput=e('<div id="celled-hidden-input" style="position:absolute; z-index:-1; left:2px; top: 2px;" contenteditable tabindex="0"></div>'),t.scroll&&s.classList.add(r);const l=e(`<div class="${o}"></div>`),a=t.scroll.stickyHeader,d=e(`<div class="${`${h} ${u} ${a?p:""}`}"></div>`),m=this.grid=e(`<div class="${c}"></div>`);s.appendChild(l),l.appendChild(this.hiddenInput),l.appendChild(m),t.cols.forEach(((t,e)=>d.appendChild(this.createHeadCell(t,e))));const v={container:s,gridContainer:l,grid:m,head:d};this.render=t.scroll.virtualScroll?new H(v):new $(v),this.createRows(),this.initMouse(),this.initKeys(),this.initClipboard(),this.resetColumnWidths()}destroy(){this.render&&(this.render.destroy(),this.render=null),this.cleanups.forEach((t=>t())),this.cleanups.length=0,this.grid&&n(this.grid),this.cells.forEach((t=>t.destroy())),this.cells.length=0,this.rows.length=0,this.grid=null,this.hiddenInput=null,this.cellInput=null,this.events=new t}on(t,e){this.events.addHandler(t,e)}update(t,e,s,i){const n=this.rows[t].cells[e];n&&(n.set(s),this.updateValue(n,i))}addRows(t){[].push.apply(this.options.rows,t),t.forEach((t=>{this.createAndAddRow(t).cells.forEach((t=>this.emitInput(t)))})),this.flattenCells(),this.renderRows()}addRow(){this.addRows([this.options.cols.map((t=>""))])}resetColumnWidths(){var t,e;(t=this.container,(e=`${k(u)} ${k(a)}`)||(e=t,t=document),[].slice.call(t.querySelectorAll(e))).forEach(((t,e)=>{const s=this.options.cols[e];if(!t.style.width&&"object"==typeof s&&s.width){const e=s.width,i="string"==typeof e?e:`${e}px`;t.style.width=i}else t.style.width=t.offsetWidth+"px"}))}createHeadCell(t,n){const l="object"==typeof t?t.name:t,o=e(`<div class="${a}" data-ci="${n}"><span>${l}</span></div>`),r=e(`<div class="${m}"></div>`);o.appendChild(r);let c=null,h=null,d=null,u=null,p=null;const v=t=>{if(p){let e=t.target;for(;e;){const t=e.getAttribute("data-ci"),s=+t;if(null!==t&&!isNaN(s)){const t=Math.min(n,s),e=Math.max(n,s);p[0]===t&&p[1]===e||(p=[t,e],this.cells.forEach((s=>s.select(s.col>=t&&s.col<=e))),this.emitSelect());break}e=e.parentElement}}else{const e=t.pageX-c;h&&(h.style.width=u-e+"px"),o.style.width=d+e+"px"}},f=()=>{c=null,p=null,i(document,"mousemove",v),i(document,"mouseup",f),this.resetColumnWidths()},w=s(o,"mousedown",(t=>{if(t.target===r)h=o.nextElementSibling,c=t.pageX,d=o.offsetWidth,u=h?h.offsetWidth:null;else if(this.rows.length){const t=+o.getAttribute("data-ci");p=!0,this.cells.forEach((e=>e.activate(!1).select(e.col===t))),p=[t,t],this.focusHiddenInput(),this.activeCell=this.rows[0].cells[t],this.emitSelect()}s(document,"mouseup",f),s(document,"mousemove",v),t.preventDefault()}));return this.cleanups.push(w),o}focusHiddenInput(){this.hiddenInput.focus({preventScroll:!0})}createAndAddRow(t){const e=new b({index:this.rows.length,cells:t,updateValueCallback:t=>this.emitInput(t)});return this.rows.push(e),e}createRows(){this.rows=[],this.options.rows.forEach((t=>this.createAndAddRow(t))),this.flattenCells(),this.renderRows()}renderRows(){this.render.rerender(this.rows)}flattenCells(){this.cells=[];for(let t=0,e=this.rows.length;t<e;++t)this.cells.push(...this.rows[t].cells)}initMouse(){let t,e,n=null;const l=(t,e,s,i)=>""+t+e+s+i,o=(t,e=0)=>{if(!t||!t.parentElement)return;const s=t.getAttribute("data-ci");if(null===s&&e<2)return o(t.parentElement,e+1);const i=t.parentElement.getAttribute("data-ri"),n=+s,l=+i;return s&&i&&!isNaN(n)&&!isNaN(l)?this.rows[l].cells[n]:void 0},r=t=>{const e=t.target;return o(e)},c=s=>{const i=r(s);if(i){const s=i.row,o=i.col,r=Math.min(s,e),c=Math.max(s,e),h=Math.min(o,t),a=Math.max(o,t),d=l(r,h,c,a);if(n!==d){n=d,this.unselect();for(let t=r;t<=c;++t)for(let e=h;e<=a;++e)this.rows[t].cells[e].select();this.emitSelect()}}},h=()=>{i(document,"mousemove",c),i(document,"mouseup",h)};let a=Date.now();const d=s(this.grid,"mousedown",(i=>{const o=r(i);if(o){const r=Date.now()-a;if(a=Date.now(),o.takesMouse())return;if(o===this.activeCell&&!o.readonly&&r<300)o.startEdit(this.cellInput),this.emitFocus();else{const i=o.row,r=o.col;e=i,t=r,n=l(i,r,i,r),this.activate(o),s(document,"mouseup",h),s(document,"mousemove",c)}i.preventDefault()}}));this.cleanups.push(d);const u=s(document,"mouseup",(t=>{if(this.activeCell){for(let e=t.target;e;e=e.parentNode)if(e===this.container)return;this.activeCell.activate(!1),this.unselect()&&this.emitSelect()}}));this.cleanups.push(u)}activate(t,e=!0){this.activeCell&&this.activeCell.activate(!1);let s=!1;this.cells.forEach((i=>{s=i===t?i.selected()!==e:s||i.selected(),i.select(!1)})),this.activeCell=t.select(e).activate(e),s&&this.emitSelect(),this.focusHiddenInput()}moveActive(t,e,s=!1){const i=this.activeCell;if(i){const n=this.rows,l=i.row+t;for(;s&&this.options.canAddRows&&l>=n.length;)this.addRow();const o=n[l];if(o){const t=o.cells[i.col+e];t&&this.activate(t)}}}initKeys(){const t=this.hiddenInput,e=this.cellInput;this.cleanups.push(s(t,"keydown",(t=>{const e=(t=t||window.event).keyCode;46===e&&(this.cells.forEach((t=>{t.selected()&&this.setCell(t,"")})),t.preventDefault()),37===e&&this.moveActive(0,-1),38===e&&this.moveActive(-1,0),39===e&&this.moveActive(0,1),40===e&&this.moveActive(1,0)})));this.cleanups.push(s(e,"input",(t=>{const e=this.activeCell;e&&!e.readonly&&e.takesKey()&&(this.updateValue(e,!0),this.cells.forEach((t=>{t.selected()&&t!==e&&this.setCell(t,e.value())})))}))),this.cleanups.push(s(e,"keydown",(t=>{13===t.keyCode&&(this.moveActive(0,0),this.moveActive(1,0,!0),t.preventDefault()),27===t.keyCode&&(this.moveActive(0,0),t.preventDefault())}))),this.cleanups.push(s(t,"keypress",(t=>{const s=this.activeCell;!s||s.readonly||s.takesKey()?t.preventDefault():(s.startEdit(e,!0),this.emitFocus())})))}pasteCSV(t,e,s,i){const n=function(t,e){const s=[];let i=!1;for(let n=0,l=0,o=0;o<t.length;o++){const r=t[o],c=t[o+1];s[n]=s[n]||[],s[n][l]=s[n][l]||"",'"'===r&&i&&'"'===c?(s[n][l]+=r,++o):'"'!==r?r!==e||i?"\r"!==r||"\n"!==c||i?"\n"!==r&&"\r"!==r||i?s[n][l]+=r:(++n,l=0):(++n,l=0,++o):++l:i=!i}return s}(t,e),l=this.activeCell;isNaN(s)&&!l||(s=isNaN(s)?l.row:s,i=isNaN(i)?l.col:i,n.forEach(((t,e)=>{let n=this.rows[s+e];if(!n&&this.options.canAddRows){const t=this.rows[s];this.addRows([t.cells.map((t=>""))]),n=this.rows[s+e]}const l=i,o=1===t.length&&""===t[0];n&&!o&&t.forEach(((t,e)=>{const s=n.cells[l+e];s&&!s.readonly&&(this.setCell(s,t),s.select())}))})))}initClipboard(){const t=s(this.hiddenInput,"paste",(t=>{t.preventDefault();const e=(t.clipboardData||window.clipboardData).getData("text");this.pasteCSV(e,"\t")})),e=s(this.hiddenInput,"copy",(t=>{t.preventDefault();const e=this.activeCell;if(!e)return;const s=[];for(let t=e.row;;t++){const i=this.rows[t],n=[];if(!i||!i.cells[e.col]||!i.cells[e.col].selected())break;for(let t=e.col;;++t){const e=i.cells[t];if(!e||!e.selected())break;n.push(e.value())}s.push(n)}(t.clipboardData||window.clipboardData).setData("text/plain",function(t,e,s="\n"){let i="";return t.forEach(((t,n)=>{n>0&&(i+=s),t.forEach(((t,s)=>{(t=t.replace(/"/g,'""')).search(/("|,|\n)/g)>=0&&(t='"'+t+'"'),s>0&&(i+=e),i+=t}))})),i}(s,"\t"))}));this.cleanups.push(t),this.cleanups.push(e)}setCell(t,e){t.readonly||(t.set(e),this.updateValue(t,!0))}unselect(){let t=!1;return this.cells.forEach((e=>{t=t||e.selected(),e.select(!1)})),t}updateValue(t,e){const s=t.col,i=this.options.rows[t.row],n=i[s];"string"==typeof n||"number"==typeof n?i[s]=t.value():n.value=t.value(),e&&this.emitInput(t)}emitInput(t){this.events.emit("input",{grid:this,col:t.col,row:t.row,value:t.value()})}emitFocus(){const t=this.activeCell;this.events.emit("focus",{grid:this,col:t.col,row:t.row,value:t.value()})}emitSelect(){this.events.emit("select",{grid:this,selection:this.cells.filter((t=>t.selected())).map((t=>({row:t.row,col:t.col})))})}}function k(t){return"."+t}function I(t){return!1!==t}export{M as Grid};
//# sourceMappingURL=celled.es6.js.map