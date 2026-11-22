(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  let bag = []; try { bag = JSON.parse(localStorage.getItem("clover-bag") || "[]"); if(!Array.isArray(bag)) bag=[]; } catch {}
  const money = value => `£${Number(value).toFixed(2)}`;
  const toast = message => {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  };
  const openModal = id => { const el = document.getElementById(id); el.classList.add("open"); el.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
  const closeModal = id => { const el = document.getElementById(id); el.classList.remove("open"); el.setAttribute("aria-hidden","true"); document.body.style.overflow=""; };
  const renderBag = () => {
    try { localStorage.setItem("clover-bag",JSON.stringify(bag)); } catch {}
    $("#bag-count").textContent = bag.length;
    $("#bag-modal-count").textContent = `(${bag.length})`;
    $("#bag-total").textContent = money(bag.reduce((sum,item)=>sum+item.price,0));
    $("#bag-items").innerHTML = bag.length ? bag.map((item,index)=>`<div class="bag-line"><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.option || "A thoughtful Clover gift")}</small><button class="remove-item" data-remove="${index}">Remove</button></div><strong>${money(item.price)}</strong></div>`).join("") : '<p class="empty-bag">Your bag is waiting for something lovely.</p>';
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const addItem = (name, price, option="") => { bag.push({name,price:Number(price),option}); renderBag(); toast(`${name} added to your bag ♡`); };
  $("#bag-open").addEventListener("click",()=>openModal("bag-modal"));
  $("#search-open").addEventListener("click",()=>{openModal("search-modal");$("#site-search").focus();});
  $$("[data-close]").forEach(button=>button.addEventListener("click",()=>closeModal(button.dataset.close)));
  $$(".overlay").forEach(overlay=>overlay.addEventListener("click",event=>{if(event.target===overlay)closeModal(overlay.id);}));
  document.addEventListener("keydown",event=>{if(event.key==="Escape")$$(".overlay.open").forEach(el=>closeModal(el.id));});
  $$(".add-button").forEach(button=>button.addEventListener("click",()=>{
    const card=button.closest(".product-card"); let option="";
    if(button.dataset.option==="colour") option=`Colour: ${$(".colour-select",card).value}`;
    if(button.dataset.option==="name"){const name=$(".personal-name",card).value.trim();if(!name){toast("Please add a name for your personalised gift.");$(".personal-name",card).focus();return;}option=`Name: ${name}` + $$("select",card).map(s=>` · ${s.value}`).join(""); const file=$(".photo-upload",card)?.files[0]; if(file) option+=` · Image: ${file.name} (local only)`;}
    if(button.dataset.option==="message"){const message=$("textarea",card).value.trim();option=message?`Message: ${message}`:"No inside message added";}
    addItem(button.dataset.product,button.dataset.price,option);
  }));
  $("#bag-items").addEventListener("click",event=>{const button=event.target.closest("[data-remove]");if(button){bag.splice(Number(button.dataset.remove),1);renderBag();}});
  $("#gift-message").addEventListener("input",event=>$("#gift-preview").textContent=event.target.value||"Your words will appear here ♡");
  $("#add-giftbox").addEventListener("click",()=>addItem("Sweet Moments Gift Box",25,$("#gift-message").value.trim()||"Personal message to be confirmed"));
  $("#add-custom-box").addEventListener("click",()=>{
    const size=$('input[name="boxsize"]:checked').value, price=size==="Small"?25:35;
    const extras=$$('input[type="checkbox"]:checked', $(".custom-copy")).map(input=>input.value);
    const message=$("#custom-message").value.trim();
    addItem(`${size} Personalised Gift Box`,price,[extras.length?extras.join(", "):"No extras selected",message?`Message: ${message}`:""].filter(Boolean).join(" · "));
  });
  $("#checkout").addEventListener("click",()=>{
    if(!bag.length){toast("Your bag is empty — find something lovely first.");return;}
    const summary=bag.map(item=>`${item.name} (${money(item.price)})`).join("\n");
    alert(`Thank you for shopping with Clover!\n\nYour demo order:\n${summary}\n\nTotal: ${money(bag.reduce((sum,item)=>sum+item.price,0))}\n\nThis prototype does not process payments. Please contact Clover to confirm your order and delivery.`);
  });
  const searchable=[...$$(".product-card")].map(card=>({name:$("h3",card)?.textContent||"",section:card.closest("section")?.id||"shop"}));
  $("#site-search").addEventListener("input",event=>{
    const query=event.target.value.toLowerCase().trim();
    const matches=searchable.filter(item=>item.name.toLowerCase().includes(query));
    $("#search-results").innerHTML=query?matches.map(item=>`<a href="#${item.section}" data-result>${escapeHtml(item.name)} <span>↗</span></a>`).join("")||"<p>No matches yet. Try candles, flowers or mug.</p>":"";
    $$("[data-result]",$("#search-results")).forEach(link=>link.addEventListener("click",()=>closeModal("search-modal")));
  });
  $(".menu-toggle").addEventListener("click",event=>{const nav=$(".main-nav");const open=nav.classList.toggle("open");event.currentTarget.setAttribute("aria-expanded",String(open));});
  $$(".main-nav a").forEach(link=>link.addEventListener("click",()=>{$(".main-nav").classList.remove("open");$(".menu-toggle").setAttribute("aria-expanded","false");}));
  $("#contact-form").addEventListener("submit",event=>{
    event.preventDefault();const data=new FormData(event.currentTarget);$("#contact-feedback").textContent=`Thanks, ${data.get("name")} — your message has been prepared in this demo. Connect a form service to receive it by email.`;event.currentTarget.reset();toast("Thank you — your message is ready.");
  });
  $("#custom-message").addEventListener("input",e=>$("#custom-preview").textContent=e.target.value||"Your words will appear here");
  $(".photo-upload").addEventListener("change",e=>{const img=$("#photo-preview"); if(img.dataset.url) URL.revokeObjectURL(img.dataset.url); const f=e.target.files[0]; img.hidden=!f; if(f){img.src=img.dataset.url=URL.createObjectURL(f);}});
  $("#year").textContent=new Date().getFullYear();
  renderBag();
})();