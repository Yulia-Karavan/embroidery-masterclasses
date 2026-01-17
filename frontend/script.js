// гортання галереї
let horzontScroll = document.querySelector(".gallery-container");
let leftBth = document.getElementById("left-bth");
let rightBth = document.getElementById("right-bth");

rightBth.addEventListener('click', ()=> {
  horzontScroll.style.scrollBehavior = "smooth"
  horzontScroll.scrollLeft += 884 ;
});

leftBth.addEventListener('click', ()=> {
  horzontScroll.style.scrollBehavior = "smooth"
  horzontScroll.scrollLeft -= 884 ;
});


// Відкривання інформації по майстер класу
document.addEventListener("DOMContentLoaded", function() {
  var links = document.querySelectorAll('.product-info a');

  links.forEach(function(link) {
    link.addEventListener('click', function(event) {
    event.preventDefault(); 
    var classTitle = this.querySelector('h3').textContent; 
    window.location.href = 'master-clas-info.html?title=' + encodeURIComponent(classTitle);
      });
  });
});

// лайк нажимається
document.addEventListener("click", function(event) {
  const icon = event.target;
  if (icon.tagName.toLowerCase() === "ion-icon" && icon.classList.contains("icon")) {
    if (icon.getAttribute("name") === "heart-outline") {
      icon.setAttribute("name", "heart");
      } else {
        icon.setAttribute("name", "heart-outline");
      }
    }
  });
// коментар підсвічується
document.addEventListener("click", function(event) {
  const icon = event.target;
  if (icon.tagName.toLowerCase() === "ion-icon" && icon.classList.contains("icon2")) {
    const originalName = icon.getAttribute("name");
    const newName = originalName === "chatbubbles-outline" ? "chatbubbles" : "chatbubbles-outline";

    icon.setAttribute("name", newName);

    setTimeout(() => {
    icon.setAttribute("name", originalName);
    }, 100);
  }
});