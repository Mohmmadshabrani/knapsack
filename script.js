var KnapIteamNum;
var knapITemsValue;
var KnapITemsWights;
var pop_array;
var pop_size;
var limit;
var fitnessScore;
var newPopulation;
const mutationRate = 1;
var averageFitness;
var bestSolution;
var Show;
var numOFgeneration;
var notChanged = 0;
var bestEver;
var chart;
var data ;
var generator = xorshift(765423);
var lastAnswer;
var firstpop;


function begin(){
    if(!(pop_array != null))
        document.getElementById("notice").innerText = "initialize a knapsack first!";
    else{
        firstpop = pop_array;
        display();
    }
}
function display(){ 
    if (chart) {
        chart.destroy();
    }
    document.getElementById("firstPhase").style.display = "none";
    document.getElementById("secondphase").style.display = "block";
    numOFgeneration = 0;
    var canvas = document.getElementById("myChart");
    document.getElementById("populationsize").innerText = "popualtion size:"+ pop_size;
    document.getElementById("numberofIteams").innerText = "number of iteams :"+ KnapIteamNum;
    data = {
        labels: [],  
        datasets: [{
            label: "Average Fitness Rate",
            data: [],  
            borderColor: "blue",
            fill: false
        }]
    };


    chart = new Chart(canvas, {
        type: 'line',
        data: data,
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of Generations'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Average Fitness Rate'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }]
            }
        }
    });

    document.getElementById("knapsackLimit").innerText = limit;
    bestEver = calculatingTotalValue(pop_array[0]);
    Show = true;
    reproduce();
}

function reproduce(){
    newPopulation = new Array();
    let NewPopNum = 0;
    while(NewPopNum < pop_size){
            var parentOne = tournamentRouletteSelect();
            var parentTwo = tournamentRouletteSelect();
            while(parentOne == parentTwo)
                parentTwo = tournamentRouletteSelect();

        // crossover
            var crossoverPoint = Math.floor(generator.next() * KnapIteamNum);
            var childOne = parentOne.slice(0, crossoverPoint).concat(parentTwo.slice(crossoverPoint));
            var childTwo = parentTwo.slice(0, crossoverPoint).concat(parentOne.slice(crossoverPoint));
            // if (!validSample(childOne)) {
            //     childOne = parentOne;
            // }
            // if (!validSample(childTwo)) {
            //     childTwo = parentTwo;
            // }

    
        // mutation
            childOne = mutateBitflip(childOne);
            // if(!validSample(childOne))
            //     continue;
            childTwo = mutateBitflip(childTwo);
            // if(!validSample(childTwo))
            //     continue;
                
        newPopulation[NewPopNum++] = childOne;
        newPopulation[NewPopNum++] = childTwo;  
    }
        pop_array = newPopulation;
        updateInfo();

        if(numOFgeneration % 500==0){          
            document.getElementById("lastAnswr").innerText = lastAnswer.join(" - "); 
            Show = false;
        }
    if(Show)
        setTimeout(reproduce,1);
}
function mutateBitflip(chromosome) {
    for (let i = 0; i < chromosome.length; i++) {
        if ((generator.next() * 100) < mutationRate) {
            chromosome[i] = ~chromosome[i] & 1;
        }
    }
    return chromosome;
}
function validSample(sample){
    return (calculatingTotalWeight(sample) < limit);
}
function updateInfo(){
    giveFitnessScore();
    averageFitness = calculatingAverageFitness();
    document.getElementById("populationsaveragefitnessrate").innerText = averageFitness;
    let a = bestAnswerever();
    bestSolution = a.join(" - ");        
    let b1 = calculatingTotalValue(a);
    let b2 = calculatingTotalWeight(a);
    if(b1 > bestEver){
        lastAnswer = a;
        bestEver = b1;
        var totalWeight = calculatingTotalWeight(a);
        document.getElementById("bestEver1").innerText = bestEver + "/" + totalWeight;
    }
    document.getElementById("NOG").innerText = ++numOFgeneration;
    document.getElementById("knapsackTotalAnswer").innerText = b1;
    document.getElementById("knapsackTotalweight").innerText = calculatingTotalWeight(a);
    document.getElementById("fitnessrate").innerText = b1 - b2;
    setTimeout(updateChart(numOFgeneration ,averageFitness) , 1);

    var b;
    var br;
    if (Array.isArray(pop_array) && pop_array.length > 0) {
        var index = Math.floor(generator.next() * pop_array.length);
        b = pop_array[index].join(" - ");
        br = document.createElement("br");
        document.getElementById("showGens").appendChild(document.createTextNode(b));
        document.getElementById("showGens").appendChild(br);
        document.getElementById("showGens").appendChild(br);
        scrollToBottom();
    }
}

// generate knapsack randomly
function genKnap(){ 
    KnapIteamNum = Math.round(generator.next() * 1000);
    knapITemsValue = new Array(KnapIteamNum);
    KnapITemsWights = new Array(KnapIteamNum);
    for(var i = 0 ; i < KnapIteamNum ; i++){
        knapITemsValue[i] = Math.round(generator.next() *100);
        KnapITemsWights[i] = Math.round(generator.next() *20);
    }
    drawKnapsackTable(knapITemsValue , KnapITemsWights);
    document.getElementById("knapsackSample").innerHTML = "";
    var totalWeight = KnapITemsWights.reduce((a,b)=>a+b);
    limit = Math.round(totalWeight * 0.8);
    initializePopulation();

}

function initializePopulation(){
    var a = document.getElementById("num_population").value;
    pop_size = parseInt(a);
    var temp = 0;
    pop_array = new Array(pop_size);
    for(var i = 0 ; i < pop_size ; i++ ){
        pop_array[i] = new Array(KnapIteamNum);
        temp = 0;
        for(var j = 0 ;j < KnapIteamNum ; j++){
            pop_array[i][j] = Math.round(generator.next());
            if(pop_array[i][j] == 1){
                temp += KnapITemsWights[j];
                // if(temp > limit){
                //     pop_array[i][j] = 0;
                //     temp -= KnapITemsWights[j];
                // }
            }  
        }
    }
    giveFitnessScore();
    averageFitness =  calculatingAverageFitness();
}
function giveFitnessScore(){
    fitnessScore = new Array(pop_size);
    var totalWeight = 0;
    var totalValue = 0;
    for(var i = 0 ; i < pop_size ; i++){
        totalValue = 0;
        totalWeight = 0;
        for(var j = 0 ; j < KnapIteamNum ; j++)
        {
            if(pop_array[i][j] == 1)
            {
                totalValue += knapITemsValue[j];
                totalWeight += KnapITemsWights[j];
            }
            if(totalWeight > limit){
                totalValue = 1;
                totalWeight = 0;
                break;
            }
        }
        fitnessScore[i] = totalValue - totalWeight;
    }
}
function selectRoulette(){
    var totalFitness = fitnessScore.reduce((a,b)=>a+b);
    var random = Math.round(generator.next() * totalFitness);
    let sum = 0;
    var i;
    for(i = 0 ; i < pop_array.length ; i++){
        sum += fitnessScore[i];
        if(sum >= random)
            break;
    }
    return pop_array[i];
}
function selectRank() {
    const ranks = rankIndividuals(pop_array);
    const rankSum = ranks.reduce((sum, rank) => sum + rank, 0);
    const random = Math.random() * rankSum;
    let sum = 0;
    for (let i = 0; i < pop_size; i++) {
      sum += ranks[i];
      if (sum >= random) {
        return pop_array[i];
      }
    }  
}
function rankIndividuals(individuals) {
    const ranks = new Array(pop_size);
    for (let i = 0; i < pop_size; i++) {
      let rank = 1;
      const fitness = calculatingTotalValue(individuals[i]);
      for (let j = 0; j < pop_size; j++) {
        if (j === i) continue;
        const otherFitness = calculatingTotalValue(individuals[j]);
        if (otherFitness > fitness) {
          rank++;
        }
      }
      ranks[i] = rank;
    }
    return ranks;
} 
function tournamentRouletteSelect() {
    const num = Math.round(pop_size * 0.05);
    const tournament = new Array(num);
    const values = new Array(num);
    for (let i = 0; i < num; i++) {
      tournament[i] = selectRoulette();
      values[i] = calculatingTotalValue(tournament[i]);
    }
  
    var maxIndex = 0;
    for(let i = 0 ; i < num ; i++){
        if(values[i] > values[maxIndex])
            maxIndex = i;
    }
    maxIndex = tournament[maxIndex];

    return maxIndex;
}
function tournamentRankSelect() {
    const num = Math.round(pop_size * 0.05);
    const tournament = new Array(num);
    const values = new Array(num);
    for (let i = 0; i < num; i++) {
      tournament[i] = selectRank();
      values[i] = calculatingTotalValue(tournament[i]);
    }
  
    var maxIndex = 0;
    for(let i = 0 ; i < num ; i++){
        if(values[i] > values[maxIndex])
            maxIndex = i;
    }
    maxIndex = tournament[maxIndex];

    return maxIndex;
}
function updateChart(numOFgeneration, averageFitness) {
    chart.data.labels.push(numOFgeneration);
    chart.data.datasets[0].data.push(averageFitness);
    chart.update();
}
function Showpopulation() {
    var table = document.createElement("table");
    
    table.style.border = "1px solid black";
        var row = table.insertRow();
    var indexCell = row.insertCell();
    indexCell.innerHTML = "Index";
    for (var i = 1; i <= fitnessScore.length; i++) {
      var cell = row.insertCell();
      cell.innerHTML = i;
    }
    
    var row2 = table.insertRow();
    var fitnessRateCell = row2.insertCell();
    fitnessRateCell.innerHTML = "Fitness rate";
    for (var i = 0; i < fitnessScore.length; i++) {
      var cell = row2.insertCell();
      cell.innerHTML = fitnessScore[i];
    }
    
    var tableDiv = document.getElementById("populationTable");
    tableDiv.innerHTML = table.outerHTML;

}
  function Showsample() {
    var numRows = 4; 
    var numCols = KnapIteamNum; 
    let random = Math.round(generator.next() * pop_array.length);
    var sample = pop_array[random];
    if(sample.length != KnapIteamNum)
        console.log("an error"); 
    var tableHTML = "<table style='border: 1px solid black;'>";
    for (var i = 0; i < numRows; i++) {
      tableHTML += "<tr>";
      for (var j = 0; j < numCols; j++) {
        if(j == 0){
            switch (i) {
                case 0: 
                  tableHTML += "<td style='border: 1px solid black;'>index</td>";
                  break;
                case 1: 
                  tableHTML += "<td style='border: 1px solid black;'>value</td>";
                  break;
                case 2: 
                  tableHTML += "<td style='border: 1px solid black;'>weight</td>";
                  break;
                case 3: 
                  tableHTML += "<td style='border: 1px solid black;'>state</td>";
                  break;
              }
        }
        tableHTML += "<td style='border: 1px solid black;'>";
  

        switch (i) {
          case 0: 
            tableHTML += j + 1;
            break;
          case 1: 
            tableHTML += knapITemsValue[j];
            break;
          case 2: 
            tableHTML += KnapITemsWights[j];
            break;
          case 3: 
            tableHTML += sample[j];
            break;
        }
  
        tableHTML += "</td>";
      }
      tableHTML += "</tr>";
    }
  
    tableHTML += "</table>";
    document.getElementById("knapsackSample").innerHTML = tableHTML;
}
function drawKnapsackTable(array1, array2) {
    const numColumns = Math.max(array1.length, array2.length) + 1; 
    const tableDiv = document.getElementsByClassName("knapsack")[0];
    let tableHTML = '<style>' +
                    'table { border-collapse: collapse; }' +
                    'table, td, th { border: 1px solid black; padding: 5px; }' +
                    '</style>';
    
    tableHTML += '<table><thead><tr><th>Index</th>';
    
    for (let i = 0; i < numColumns - 1; i++) {
      tableHTML += '<th>' + (i + 1) + '</th>';
    }
    
    tableHTML += '</tr></thead><tbody>';
    
    tableHTML += '<tr><td>Values</td>';
    for (let i = 0; i < array1.length; i++) {
      tableHTML += '<td>' + array1[i] + '</td>';
    }
    for (let i = array1.length; i < numColumns - 1; i++) {
      tableHTML += '<td></td>';
    }
    tableHTML += '</tr>';
    
    tableHTML += '<tr><td>Weights</td>';
    for (let i = 0; i < array2.length; i++) {
      tableHTML += '<td>' + array2[i] + '</td>';
    }
    for (let i = array2.length; i < numColumns - 1; i++) {
      tableHTML += '<td></td>';
    }
    tableHTML += '</tr>';
    
    tableHTML += '</tbody></table>';
    tableDiv.innerHTML = tableHTML;
}
function calculatingAverageFitness(){
    let sum = 0;
    for(var i =  0 ; i < pop_size ; i++ )
        sum += fitnessScore[i];
    return (sum / pop_size);
}
function bestAnswerever(){
    return pop_array[fitnessScore.indexOf(Math.max(...fitnessScore))];
}
function calculatingTotalValue(a) {
    var sum = 0 ;
    for(let i = 0 ;  i < KnapIteamNum ; i++){
        if(a[i] == 1)
            sum += knapITemsValue[i];
    }
    return sum;
}
function calculatingTotalWeight(a) {
    var sum = 0 ;
    for(let i = 0 ;  i < KnapIteamNum ; i++){
        if(a[i] == 1)
            sum += KnapITemsWights[i];
    }
    return sum;
}
function scrollToBottom() {
    var showGensDiv = document.getElementById("showGens");
    showGensDiv.scrollTop = showGensDiv.scrollHeight;
}
function xorshift(seed) {
    let x = seed;
    return {
      next: function() {
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return (x >>> 0) / 4294967296; 
      }
    };
}
function reapete(){
    pop_array = firstpop;
    display();
}
function alter(){
    Show = false;
}