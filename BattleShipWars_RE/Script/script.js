let shipselection = true;
let zufall = true;
let fire = false;
let start = false;

let timer = 0;
let heropoints = 0;
let enemypoints = 0;

let currentPlayer = 0;
let computerAttacks = [];







$(document).ready(function() {
    let selectedShip = null;
    let selectedOrientation = $('input[name="orientation"]:checked').attr('id');

    // Funktion zur Überprüfung, was der Benutzer gewählt hat
    $('input[name="ship"], input[name="orientation"]').change(function() {
        selectedShip = ($(this).attr('name') === 'ship') ? $(this).attr('id') : selectedShip;
        selectedOrientation = ($(this).attr('name') !== 'ship') ? $(this).attr('id') : selectedOrientation;
    });

    // Funktion zur Überprüfung, ob das Schiff hier platziert werden darf oder nicht
    function canPlaceShip(x, y, shipLength, orientation) {
        if (x < 1 || x > 10 || y < 1 || y > 10) {
            return false; // Koordinaten liegen außerhalb des Spielfelds
        }

        for (let i = 0; i < shipLength; i++) {
            let cellId = (orientation === 'horizontal') ? `#x${x + i}_y${y}` : `#x${x}_y${y + i}`;

            if (!$(cellId).length || !$(cellId).hasClass('herofield_ship_empty')) {
                return false;
            }

            let startX = Math.max(x - 1, 1);
            let startY = Math.max(y - 1, 1);
            let endX = (orientation === 'horizontal') ? x + i + 1 : x + 1;
            let endY = (orientation === 'vertical') ? y + i + 1 : y + 1;

            for (let checkX = startX; checkX <= endX; checkX++) {
                for (let checkY = startY; checkY <= endY; checkY++) {
                    if (checkX === x + i && checkY === y) {
                        continue;
                    }

                    let adjCellId = `#x${checkX}_y${checkY}`;

                    if ($(adjCellId).hasClass('herofield_ship_full')) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Funktion zum Platzieren eines Schiffes
    function placeShip(x, y, shipLength, orientation) {
        for (let i = 0; i < shipLength; i++) {
            let cellId = (orientation === 'horizontal') ? `#x${x + i}_y${y}` : `#x${x}_y${y + i}`;
            $(cellId).removeClass('herofield_ship_empty').addClass('herofield_ship_full');
            zufall = false;
        }
    }

    // Behandlung des Klicks auf ein Spielfeld-Feld
    $('#herofield td').click(function() {
        if (shipselection) {
            if (!selectedShip || !selectedOrientation) {
                alert('Bitte wählen Sie ein Schiff und eine Ausrichtung aus.');
                return;
            }

            let cellId = $(this).attr('id');
            let [x, y] = cellId.split('_').map(part => parseInt(part.replace(/\D/g, '')));
            let shipLength = parseInt(selectedShip.split('cellship_')[0]);

            if (canPlaceShip(x, y, shipLength, selectedOrientation)) {
                placeShip(x, y, shipLength, selectedOrientation);
                $(`#${selectedShip}`).remove();
                $(`input[id="${selectedShip}"]`).remove();
                selectedShip = null;
            } else {
                alert('Das Schiff kann nicht an der angegebenen Position platziert werden.');
            }
        }
    });







    

    // "Zufall"
    $('#zufall').click(function() {
        if (zufall) {
            zufall = false;
            shipselection = false;

            let templates = [
                ['#x1_y1', '#x1_y2', '#x1_y3', '#x1_y4', '#x3_y2', '#x3_y3', '#x3_y4', '#x1_y8', '#x2_y8', '#x3_y8', '#x9_y1', '#x9_y2', '#x5_y5', '#x5_y6', '#x8_y9', '#x9_y9', '#x6_y1', '#x5_y3', '#x9_y5', '#x4_y10'],
                ['#x1_y1', '#x2_y1', '#x8_y2', '#x9_y2', '#x4_y3', '#x5_y3', '#x10_y4', '#x1_y5', '#x4_y6', '#x5_y6', '#x6_y6', '#x7_y6', '#x1_y8', '#x8_y8', '#x1_y10', '#x2_y10', '#x3_y10', '#x6_y10', '#x7_y10', '#x8_y10'],
                ['#x1_y1', '#x8_y1', '#x4_y2', '#x8_y2', '#x2_y3', '#x4_y3', '#x10_y3', '#x4_y4', '#x1_y6', '#x10_y6', '#x1_y7', '#x3_y7', '#x4_y7', '#x5_y7', '#x6_y7', '#x8_y8', '#x2_y10', '#x8_y9', '#x2_y9', '#x8_y7'],
                ['#x1_y1', '#x3_y1', '#x5_y1', '#x7_y1', '#x2_y3', '#x2_y4', '#x5_y3', '#x5_y4', '#x8_y3', '#x8_y4', '#x1_y6', '#x2_y6', '#x3_y6', '#x5_y6', '#x6_y6', '#x7_y6', '#x1_y9', '#x2_y9', '#x3_y9', '#x4_y9'],
                ['#x1_y1', '#x1_y3', '#x1_y5', '#x1_y7', '#x3_y1', '#x3_y2', '#x3_y4', '#x3_y5', '#x3_y7', '#x3_y8', '#x5_y2', '#x5_y3', '#x5_y5', '#x5_y6', '#x5_y8', '#x5_y9', '#x7_y1', '#x7_y2', '#x7_y3', '#x7_y4'],
            ];

            // Zufallszahlengenerierung
            let randomIndex = Math.floor(Math.random() * templates.length);

            templates[randomIndex].forEach(cell => {
                $(`#herofield ${cell}`).addClass('herofield_ship_full').removeClass('herofield_ship_empty');
            });
        }
    });
});








function switchTurn() {
    if (start) {
        if (currentPlayer % 2 === 0) {
            fire = true;
        } else {
            fire = false;
            computerMove();
        }
    }
}

// Schießen
$('#enemyfield td').click(function() {
    if (fire && !$(this).hasClass('enemyfield_ship_miss')) {
        if ($(this).hasClass('enemyfield_ship_empty')) {
            $(this).text('•');
            $(this).addClass('enemyfield_ship_miss');
            currentPlayer++;
            switchTurn();
        } else if ($(this).hasClass('enemyfield_ship_full')) {
            $(this).text('X');
            heropoints++;
            $(this).addClass('enemyfield_ship_point');
            currentPlayer += 2;
            switchTurn();
        }
    }
});


function computerMove() {
    let randomX, randomY;

    do {
        randomX = Math.floor(Math.random() * 10) + 1;
        randomY = Math.floor(Math.random() * 10) + 1;
    } while (computerAttacks.includes(`x${randomX}_y${randomY}`));

    computerAttacks.push(`x${randomX}_y${randomY}`);

    let cellIdcomp = `#x${randomX}_y${randomY}`;

    if ($(cellIdcomp).hasClass('herofield_ship_empty')) {
        $(cellIdcomp).text('•');
        currentPlayer += 1;
    } else if ($(cellIdcomp).hasClass('herofield_ship_full')) {
        $(cellIdcomp).text('X');
        $(cellIdcomp).addClass('herofield_ship_point');
        enemypoints += 1;
        currentPlayer += 2;
    }
    switchTurn();
}















// Start
$(document).ready(function() {
    $('#start').click(function() {
        shipselection = false;
        zufall = false;
        fire = true;
        start = true;
        
        alert('Spiel gestartet!');

        // Zufällige Auswahl der enemy Schiffe

        let templates = [
            ['#x1_y1', '#x1_y2', '#x1_y3', '#x1_y4', '#x3_y2', '#x3_y3', '#x3_y4', '#x1_y8', '#x2_y8', '#x3_y8', '#x9_y1', '#x9_y2', '#x5_y5', '#x5_y6', '#x8_y9', '#x9_y9', '#x6_y1', '#x5_y3', '#x9_y5', '#x4_y10'],
            ['#x1_y1', '#x2_y1', '#x8_y2', '#x9_y2', '#x4_y3', '#x5_y3', '#x10_y4', '#x1_y5', '#x4_y6', '#x5_y6', '#x6_y6', '#x7_y6', '#x1_y8', '#x8_y8', '#x1_y10', '#x2_y10', '#x3_y10', '#x6_y10', '#x7_y10', '#x8_y10'],
            ['#x1_y1', '#x8_y1', '#x4_y2', '#x8_y2', '#x2_y3', '#x4_y3', '#x10_y3', '#x4_y4', '#x1_y6', '#x10_y6', '#x1_y7', '#x3_y7', '#x4_y7', '#x5_y7', '#x6_y7', '#x8_y8', '#x2_y10', '#x8_y9', '#x2_y9', '#x8_y7'],
            ['#x1_y1', '#x3_y1', '#x5_y1', '#x7_y1', '#x2_y3', '#x2_y4', '#x5_y3', '#x5_y4', '#x8_y3', '#x8_y4', '#x1_y6', '#x2_y6', '#x3_y6', '#x5_y6', '#x6_y6', '#x7_y6', '#x1_y9', '#x2_y9', '#x3_y9', '#x4_y9'],
            ['#x1_y1', '#x1_y3', '#x1_y5', '#x1_y7', '#x3_y1', '#x3_y2', '#x3_y4', '#x3_y5', '#x3_y7', '#x3_y8', '#x5_y2', '#x5_y3', '#x5_y5', '#x5_y6', '#x5_y8', '#x5_y9', '#x7_y1', '#x7_y2', '#x7_y3', '#x7_y4'],
        ];

        // Zufallszahlengenerierung
        let randomIndex = Math.floor(Math.random() * templates.length);

        templates[randomIndex].forEach(cell => {
            $(`#enemyfield ${cell}`).addClass('enemyfield_ship_full').removeClass('enemyfield_ship_empty');
        });

        switchTurn();
    });
});










$('.re').click(function() {
    $('.enemyfield_ship_full').css('background-color', 'rgb(120, 97, 12)');
});
 
$('.ba').click(function() {
    location.reload();
});










function checkHeropoints() {
    if (heropoints == 20) {
        alert('Gewinn!');
        heropoints = heropoints + 1;
    }
}

function checkEnemypoints() {
    if (enemypoints == 20) {
        alert('Leider haben Sie verloren.');
        enemypoints = enemypoints + 1;
    }
}

setInterval(checkHeropoints, 100);
setInterval(checkEnemypoints, 100);
setInterval(switchTurn, 500);





