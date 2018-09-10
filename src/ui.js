// Define UI elements
let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild,
    gyro: {
        container: document.getElementById('gyro'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('gyro-arm'),
        number: document.getElementById('gyro-number')
    },
    example: {
        button: document.getElementById('example-button'),
        readout: document.getElementById('example-readout').firstChild
    },
    //autoSelect: document.getElementById('auto-select'),
    selectorBox: document.getElementById("selectors")
};
var chooserNames = [];

// Key Listeners
NetworkTables.addGlobalListener(onValueChanged, true);
function onValueChanged(key, value, isNew) {
    console.log(NetworkTables.getKeys());
    if (isNew && key.startsWith("/SmartDashboard")) {
        var keyArr = key.split("/");
        //for choosers
        if (key.endsWith("options")) {
            chooserNames.push(keyArr[2]);
            console.log(keyArr[2]);
            /*var box = document.createElement("div");
            ui.selectorBox.appendChild(box);*/
			if(value.length == 2){
				var cb = document.creatElement("input");
				cb.type = "checkbox";
				cb.id = keyArr[2];
				ui.selectorBox.appendChild(cb);
				var name = document.createElement("label");
				name.for = keyArr[2];
				name.innerHTML = keyArr[2];
				ui.selectorBox.appendChild(name);
			}else{
				var name = document.createElement("p");
				name.innerHTML = keyArr[2];
				ui.selectorBox.appendChild(name);
				var select = document.createElement("select");
				select.id = keyArr[2];
				ui.selectorBox.appendChild(select);
				select.onchange = function () {
					console.log("changed");
					NetworkTables.putValue('/SmartDashboard/' + keyArr[2] + '/selected', this.value);
					console.log(name.innerHTML + ": " + this.value);
				}
				for (var a in value) {
					var choice = document.createElement("option");
					choice.innerHTML = value[a];
					select.appendChild(choice);
				}
			}
        } else if ((typeof value == "number" || typeof value == "string") && keyArr.length == 3) {
            var display = document.createElement("p");
            display.id = keyArr[2];
            display.innerHTML = keyArr[2] + " : " + value;
            document.getElementById("printouts").appendChild(display);
        } else if (typeof value == "boolean") {
            /*var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("height", 15);
            svg.setAttribute("width", 15);
            var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", 7.5);
            circle.setAttribute("cy", 7.5);
            circle.setAttribute("r", 7.5);
            circle.setAttribute("stroke-width",0)*/
            var display = document.createElement("p");
            display.innerHTML = keyArr[2] + " : ";
            var val = document.createElement("span");
            val.innerHTML = value;
            if (value) {
                val.style.color = "#37cc12";
            } else {
                val.style.color = "#e2280f";
            }
            display.appendChild(val);
            document.getElementById("booleans").appendChild(display);
            NetworkTables.addKeyListener(key, (key, value) => {
                display.innerHTML = keyArr[2] + " : " + value;
                if (value) {
                    val.style.color = "#37cc12";
                } else {
                    val.style.color = "#e2280f";
                }
            });
        }
    }
}
// Gyro rotation
let updateGyro = (key, value) => {
    ui.gyro.val = value;
    ui.gyro.visualVal = Math.floor(ui.gyro.val - ui.gyro.offset);
    ui.gyro.visualVal %= 360;
    if (ui.gyro.visualVal < 0) {
        ui.gyro.visualVal += 360;
    }
    ui.gyro.arm.style.transform = `rotate(${ui.gyro.visualVal}deg)`;
    ui.gyro.number.innerHTML = ui.gyro.visualVal + 'º';
};
NetworkTables.addKeyListener('/SmartDashboard/Gyro Angle:', updateGyro);

// This button is just an example of triggering an event on the robot by clicking a button.
NetworkTables.addKeyListener('/SmartDashboard/example_variable', (key, value) => {
    // Set class active if value is true and unset it if it is false
    ui.example.button.classList.toggle('active', value);
    ui.example.readout.data = 'Value is ' + value;
});

NetworkTables.addKeyListener('/SmartDashboard/Potentiometer Output', (key, value) => {
    ui.potOutput.innerHTML = "Potentiometer Output: " + value;
});

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.innerHTML = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

// Load list of prewritten autonomous modes
/*NetworkTables.addKeyListener('/SmartDashboard/Auto Strategy/options', (key, value) => {
    // Clear previous list
    while (ui.autoSelect.firstChild) {
        ui.autoSelect.removeChild(ui.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    ui.autoSelect.value = NetworkTables.getValue('/SmartDashboard/currentlySelectedMode');
});*/

// Load list of prewritten autonomous modes
/*NetworkTables.addKeyListener('/SmartDashboard/autonomous/selected', (key, value) => {
    ui.autoSelect.value = value;
});*/

// The rest of the doc is listeners for UI elements being clicked on
ui.example.button.onclick = function () {
    // Set NetworkTables values to the opposite of whether button has active class.
    NetworkTables.putValue('/SmartDashboard/example_variable', this.className != 'active');
};
// Reset gyro value to 0 on click
ui.gyro.container.onclick = function () {
    // Store previous gyro val, will now be subtracted from val for callibration
    ui.gyro.offset = ui.gyro.val;
    // Trigger the gyro to recalculate value.
    updateGyro('/SmartDashboard/drive/navx/yaw', ui.gyro.val);
};
// Update NetworkTables when autonomous selector is changed
/*ui.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/autonomous/selected', this.value);
};*/
// Get value of arm height slider when it's adjusted
ui.armPosition.oninput = function () {
    NetworkTables.putValue('/SmartDashboard/arm/encoder', parseInt(this.value));
};

addEventListener('error', (ev) => {
    ipc.send('windowError', { mesg: ev.message, file: ev.filename, lineNumber: ev.lineno })
})
/*console.log(chooserNames[0]);
//for (var a in chooserNames) {
    document.getElementById(chooserNames[0]).onchange = function () {
        NetworkTables.putValue('/SmartDashboard/' + chooserNames[0] + '/selected', this.value);
        console.log(chooserNames[0] + ": " + this.value);
    }
//}*/

function inArray(arr, obj) {
    for (var a in arr) {
        if (obj == arr[a]) {
            return true;
        }
    }
    return false;
}