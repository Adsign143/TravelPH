/* ======================================
   TRAVEL PH JAVASCRIPT
====================================== */

// ===========================
// HEART BUTTON
// ===========================

const hearts = document.querySelectorAll(".card i");

hearts.forEach((heart) => {

    heart.addEventListener("click", () => {

        heart.classList.toggle("fa-regular");
        heart.classList.toggle("fa-solid");

        if (heart.classList.contains("fa-solid")) {
            heart.style.color = "red";
        } else {
            heart.style.color = "white";
        }

    });

});


// ===========================
// SMOOTH SCROLL
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e){

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({
                behavior:"smooth"
            });

        }

    });

});


// ===========================
// SUBSCRIBE FORM
// ===========================

const form = document.querySelector(".subscribe form");

if(form){

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const email = form.querySelector("input").value;

    if(email === ""){

        alert("Please enter your email.");

        return;

    }

    alert("Thank you for subscribing!");

    form.reset();

});

}


// ===========================
// SCROLL TO TOP BUTTON
// ===========================

const topButton = document.createElement("button");

topButton.innerHTML = "↑";

topButton.id = "topButton";

document.body.appendChild(topButton);

topButton.style.position = "fixed";
topButton.style.bottom = "30px";
topButton.style.right = "30px";
topButton.style.width = "45px";
topButton.style.height = "45px";
topButton.style.border = "none";
topButton.style.borderRadius = "50%";
topButton.style.background = "#3949ab";
topButton.style.color = "#fff";
topButton.style.fontSize = "20px";
topButton.style.cursor = "pointer";
topButton.style.display = "none";
topButton.style.boxShadow = "0 5px 10px rgba(0,0,0,.3)";
topButton.style.zIndex = "999";


window.addEventListener("scroll",()=>{

    if(window.scrollY > 400){

        topButton.style.display = "block";

    }else{

        topButton.style.display = "none";

    }

});


topButton.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});


// ===========================
// FADE-IN ANIMATION
// ===========================

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

    if(entry.isIntersecting){

        entry.target.style.opacity="1";

        entry.target.style.transform="translateY(0)";

    }

});

},{
    threshold:0.2
});

sections.forEach(section=>{

    section.style.opacity="0";
    section.style.transform="translateY(50px)";
    section.style.transition=".8s ease";

    observer.observe(section);

});


// ===========================
// ACTIVE NAV LINK
// ===========================

const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll",()=>{

let current = "";

sections.forEach(section=>{

const sectionTop = section.offsetTop - 120;

if(pageYOffset >= sectionTop){

current = section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href") == "#" + current){

link.classList.add("active");

}

});

});


// ===========================
// HERO BUTTON ANIMATION
// ===========================

const buttons = document.querySelectorAll(".btn");

buttons.forEach(btn=>{

btn.addEventListener("mouseenter",()=>{

btn.style.transform="scale(1.05)";

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="scale(1)";

});

});


// ===========================
// CARD HOVER EFFECT
// ===========================

const cards = document.querySelectorAll(".card");

cards.forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.transition=".4s";

});

});
