document.addEventListener("DOMContentLoaded", function () {
  
  
  
let selectEl= document.querySelector("select")
let years = []
let OptionList = []
let currentYear = new Date
const NumberYear = currentYear.getFullYear() - 2000

for (var i = 0; i <=NumberYear ; i++) {
  years.push(2000 + i)
  
}

years.forEach((year)=>{
  OptionList.push(`<option value="${year}">${year}</option>`)
})

OptionList.reverse()

const joinedOptions = OptionList.join(' ');

selectEl.innerHTML = joinedOptions;




const imageGrid = document.getElementById('GallerywrapperGrid');

        for (let i = 1; i <= 12; i++) {
            const div = document.createElement('div');
            div.className = 'gridImageItem';
            const img = document.createElement('img');
            img.src = `https://picsum.photos/200/200?random=${i}`; // Random image from Lorem Picsum
            img.alt = `Image ${i}`;
            div.appendChild(img);
            imageGrid.appendChild(div);
        }
})
