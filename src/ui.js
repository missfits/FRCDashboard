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
    robotPrintoutBox: document.getElementById("robot-printouts"),
    piPrintoutBox: document.getElementById("pi-printouts"),
    simulatorButton: document.getElementById("simulator-button"),
    piButton: document.getElementById("pi-button"),
    divs: document.getElementsByTagName("div"),
    distBar: document.getElementById("distBar"),
    distSvg: document.getElementById("distSvg"),
    visionButton: document.getElementById("test-vision"),
    reverseButton: document.getElementById("test-reverse")
};
var keys = [];
var chooserNames = [];
var testing = false;
var piMode = false;
distSvg.setAttribute("height",document.body.scrollHeight);
distBar.setAttribute("height",document.body.scrollHeight);
/*
TODO: make exit test mode button
take gyro printout out (it's redundant)
clean up & comment code
*/
// Key Listeners
NetworkTables.addGlobalListener(onValueChanged, true);
function onValueChanged(key, value, isNew) {
    if (isNew && !keys.includes(key) && (key.startsWith("/SmartDashboard") || key.startsWith("/RaspberryPi"))) {
        var keyArr = key.split("/");
        keys.push(key);
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
                };
                var label = document.createElement("label");
                label.setAttribute("for",value[a]);
                var t = document.createTextNode(value[a]);
                label.appendChild(t);
                f.appendChild(label);
                var br = document.createElement("br");
                f.appendChild(br);
            }
        //for other printouts
        } else if (keyArr.length == 3) {
            var display = document.createElement("p");
            var keySpan = document.createElement("span");
            keySpan.innerHTML = keyArr[2] + ": ";
            keySpan.className = "var-label";
            display.appendChild(keySpan);
            var val = document.createElement("span");
            val.innerHTML = typeof value == "number"? value.toFixed(5):value;
            display.appendChild(val);
			if(typeof value == "number" || typeof value == "string"){
                if(key.startsWith("/SmartDashboard")){
                    ui.robotPrintoutBox.appendChild(display);
                }else{
                    ui.piPrintoutBox.appendChild(display);
                }
			}else if(typeof value == "boolean"){
				val.style.color = value? "#37cc12": "#e2280f";
				ui.booleanBox.appendChild(display);
			}
			NetworkTables.addKeyListener(key, (key, value) => {
				val.innerHTML = typeof value == "number" ? value.toFixed(5) : value;
				if(typeof value == "boolean"){
					val.style.color = value ? "#37cc12" : "#e2280f";
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
NetworkTables.addKeyListener('/SmartDashboard/Gyro Angle', updateGyro);
ui.piButton.onclick = function(){
    piMode = true;
    connect();
}
console.log(ui.visionButton);
ui.visionButton.onclick = function(){
    var currentMode = NetworkTables.getValue("/RaspberryPi/Vision Mode",false);
    console.log(currentMode);
    NetworkTables.putValue("/RaspberryPi/Vision Mode", !currentMode);
}
ui.reverseButton.onclick = function(){
    var currentMode = NetworkTables.getValue("/RaspberryPi/Reverse Drive",false);
    console.log(currentMode);
    NetworkTables.putValue("/RaspberryPi/Reverse Drive", !currentMode);
}

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.innerHTML = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

NetworkTables.addKeyListener("/RaspberryPi/Contour Number", (key,value)=>{
    if(NetworkTables.getValue("/RaspberryPi/Vision Mode",false)){
        changeBaseColor(value >= 2? "#37cc12" : "#e2280f");
    }else{
        changeBaseColor("#222");
    }
});

NetworkTables.addKeyListener('/SmartDashboard/Distance(in)', (key,value) =>{
    ui.distBar.style.height = (value*3) - 28;
});

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
        if(d.id != "values" && d.id != "booleans" & d.id != "robot-printouts" && d.id != "pi-printouts" && d.className != "chooserContainer"){
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