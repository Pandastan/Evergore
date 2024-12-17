// ==UserScript==
// @name         Simpler Kampfauswerter
// @namespace    http://tampermonkey.net/
// @downloadURL  https://github.com/Pandastan/Evergore/raw/refs/heads/master/scripts/EG_Kampfauswerter_simple.user.js
// @updateURL    https://github.com/Pandastan/Evergore/raw/refs/heads/master/scripts/EG_Kampfauswerter_simple.user.js
// @version      1.1
// @description  Berechnet Werte aus Kampfereignisse logs.
// @author       Eros
// @match        *://evergore.de/*page=battle_report*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Function to parse logs and calculate stats
    function analyzeLogs() {
    const eventDiv = document.querySelector("#EgEvents");
    if (!eventDiv) return;

    const logs = eventDiv.innerText.split("\n");
    const stats = {};

    // Patterns for attacks and effects
    const attackPattern = /^\d+:\d+\s+([\wÄÖÜäöüß\s#\d-]+) \[.*?\] greift ([\wÄÖÜäöüß\s#\d-]+) an: verursacht (\d+) Schaden/;
    const effectPattern = /^\d+:\d+\s+\[([\wÄÖÜäöüß\s#\d-]+)\] wirkt auf ([\wÄÖÜäöüß\s#\d-]+): verursacht (\d+) Schaden/;
    const healPattern = /^\d+:\d+\s+([\wÄÖÜäöüß\s#\d-]+) .*? heilt (\d+) LP/;

        logs.forEach(line => {
        let match;

        console.log("Processing line:", line);

        // Match standard attacks
        if ((match = line.match(attackPattern))) {
            console.log("Standard attack match:", match);
            const attacker = match[1].trim();
            const target = match[2].trim();
            const damage = parseInt(match[3], 10);

            stats[attacker] = stats[attacker] || { dealt: 0, received: 0, healed: 0 };
            stats[attacker].dealt += damage;

            stats[target] = stats[target] || { dealt: 0, received: 0, healed: 0 };
            stats[target].received += damage;
        }

        // Match effect-based damage (e.g., [Orkan] wirkt auf ...)
        else if ((match = line.match(effectPattern))) {
            console.log("Effect match:", match);
            const effect = match[1].trim(); // Skill or effect name
            const target = match[2].trim();
            const damage = parseInt(match[3], 10);

            stats[effect] = stats[effect] || { dealt: 0, received: 0, healed: 0 };
            stats[effect].dealt += damage;

            stats[target] = stats[target] || { dealt: 0, received: 0, healed: 0 };
            stats[target].received += damage;
        }

        // Match healing
        else if ((match = line.match(healPattern))) {
            console.log("Heal match:", match);
            const healer = match[1].trim();
            const heal = parseInt(match[2], 10);

            stats[healer] = stats[healer] || { dealt: 0, received: 0, healed: 0 };
            stats[healer].healed += heal;
        }
    });

    console.log("Final stats:", stats);
    return stats;
}



    // Function to create the table
    function createTable(stats) {
        const table = document.createElement("table");
        table.border = "1";
        table.style.margin = "10px 0";
        table.style.width = "50%";
        table.style.textAlign = "center";

        // Create header row
        const header = table.insertRow();
        ["Entity", "Schaden", "Schaden bekommen", "Heilung"].forEach(text => {
            const th = document.createElement("th");
            th.innerText = text;
            th.style.backgroundColor = "#ddd";
            th.style.padding = "5px";
            th.style.border = "1px solid #ccc";
            header.appendChild(th);
        });

        // Populate rows with data
        Object.entries(stats).forEach(([entity, data]) => {
            const row = table.insertRow();
            row.insertCell(0).innerText = entity; // Display exact entity name
            row.insertCell(1).innerText = data.dealt;
            row.insertCell(2).innerText = data.received;
            row.insertCell(3).innerText = data.healed;
        });

        return table;
    }

    // Insert table into the DOM
    function insertTable() {
        const stats = analyzeLogs();
        if (!stats)
            return;

        // Find the exact <h2> element with the text "Kampfereignisse (Log)"
        const headers = document.querySelectorAll("h2");
        let targetHeader = null;

        headers.forEach(header => {
            if (header.textContent.trim() === "Kampfereignisse (Log)") {
                targetHeader = header;
            }
        });

        if (targetHeader) {
            const table = createTable(stats);
            targetHeader.parentNode.insertBefore(table, targetHeader);
        }
    }

    // Run the script after the page is loaded
    window.addEventListener("load", insertTable);
})();
