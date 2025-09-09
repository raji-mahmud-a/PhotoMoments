const selectEl = document.querySelector("#yearSelect")
let years = []

let currentYear = new Date
const NumberYear = currentYear.getFullYear() - 2000

for (var i = 0; i <=NumberYear ; i++) {
  if (i<=9) {
    years.push(`200${i}`)
  } else {
    years.push(`20${i}`)
  }
  
}
