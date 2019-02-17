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
    selectorBox: document.getElementById("select-container"),
    booleanBox: document.getElementById("booleans"),
    printoutBox: document.getElementById("printouts"),
    simulatorButton: document.getElementById("simulator-button"),
    piButton: document.getElementById("pi-button"),
    divs: document.getElementsByTagName("div")
};
var chooserNames = [];
var testing = false;
var piMode = false;
/*
TODO: make exit test mode button
take gyro printout out (it's redundant)
clean up & comment code
*/
// Key Listeners
NetworkTables.addGlobalListener(onValueChanged, true);
function onValueChanged(key, value, isNew) {
    if (isNew && (key.startsWith("/SmartDashboard") || key.startsWith("/RaspberryPi"))) {
        var keyArr = key.split("/");
        //for choosers
        if (key.endsWith("options")) {
            chooserNames.push(keyArr[2]);
            var def = NetworkTables.getValue("/SmartDashboard/" + keyArr[2] + "/default");
            var box = document.createElement("div");
            box.className = "chooserContainer";
            ui.selectorBox.appendChild(box);
		    var name = document.createElement("p");
			name.innerHTML = keyArr[2];
            box.appendChild(name);
            name.className = "title";
            var f = document.createElement("form");
            box.appendChild(f);
            for (var a in value) {
                var button = document.createElement("input");
                button.setAttribute("type", "radio");
                button.setAttribute("name", keyArr[2]);
                button.id = value[a];
                if (value[a] == def) {
                    button.checked = true;
                }
                f.appendChild(button);
                button.onclick = function () {
                    NetworkTables.putValue('/SmartDashboard/' + keyArr[2] + '/selected', this.id);
                    //console.log(this.id);
                };
                var label = document.createElement("label");
                label.setAttribute("for",value[a]);
                var t = document.createTextNode(value[a]);
                label.appendChild(t);
                f.appendChild(label);
                var br = document.createElement("br");
                f.appendChild(br);
            }
        } else if (keyArr.length == 3) {
            var display = document.createElement("p");
            var keySpan = document.createElement("span");
            keySpan.innerHTML = keyArr[2] + ": ";
            keySpan.className = "var-label";
            display.appendChild(keySpan);
            var val = document.createElement("span");
            val.innerHTML = value;
            display.appendChild(val);
			if(typeof value == "number" || typeof value == "string"){
				ui.printoutBox.appendChild(display);
			}else if(typeof value == "boolean"){
				val.style.color = value? "#37cc12": "#e2280f";
				ui.booleanBox.appendChild(display);
			}
			NetworkTables.addKeyListener(key, (key, value) => {
				val.innerHTML = value;
				if(typeof value == "boolean"){
					val.style.color = value? "#37cc12": "#e2280f";
				}
			});
        } /*else if (typeof value == "boolean") {
            var display = document.createElement("p");
            var keySpan = document.createElement("span");
            keySpan.innerHTML = keyArr[2] + " : ";
            keySpan.className = "var-label";
            var val = document.createElement("span");
            val.innerHTML = value;
            if (value) {
                val.style.color = "#37cc12";
            } else {
                val.style.color = "#e2280f";
            }
            display.appendChild(keySpan);
            display.appendChild(val);
            ui.booleanBox.appendChild(display);
            NetworkTables.addKeyListener(key, (key, value) => {
                val.innerHTML = value;
                if (value) {
                    val.style.color = "#37cc12";
                } else {
                    val.style.color = "#e2280f";
                }
            });
        }*/
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
ui.piButton.onClick = function(){
    piMode = true;
    connect();
}
NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.innerHTML = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

NetworkTables.addKeyListener("/RaspberryPi/Vision Mode", (key,value) =>{
    if(value){
        if(NetworkTables.getValue("/RaspberryPi/Contour Number",0) == 2){
            changeBaseColor("#37cc12");
        }else{
            changeBaseColor("#e2280f");
        }
    }else{
        changeBaseColor("#222");
    }
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
function changeBaseColor(color){
    document.body.style.backgroundColor = color;
    for(var d of ui.divs){
        if(d.id != "values" && d.id != "booleans" & d.id != "printouts" && d.className != "chooserContainer"){
            d.style.backgroundColor = color;
        }
    }
}
function inArray(arr, obj) {
    for (var a of arr) {
        if (obj == arr[a]) {
            return true;
        }
    }
    return false;
}