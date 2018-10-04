let address = 'roborio-6418-frc.local',
  buttonConnect = document.getElementById('connect-button');

let connectedVar = false;
ipc.send('connect', address);
// Set function to be called on NetworkTables connect. Not implemented.
//NetworkTables.addWsConnectionListener(onNetworkTablesConnection, true);

// Set function to be called when robot dis/connects
NetworkTables.addRobotConnectionListener(onRobotConnection, false);

/**
 * Function to be called when robot connects
 * @param {boolean} connected
 */
function onRobotConnection(connected) {
    var state = connected ? 'Robot connected!' : 'Robot disconnected.';
    console.log(state);
    if (connected) {
        ui.selectorBox.innerHTML = "";
        ui.booleanBox.innerHTML = "";
        ui.printoutBox.innerHTML = "";
        ui.simulatorButton.style.display = "none";
    } else {
        ui.simulatorButton.style.display = "inline-block";
    }
    ui.robotState.textContent = state;
    connectedVar = connected;
    buttonConnect.innerText = (connected ? "Disconnect" : "Connect");
}

buttonConnect.onclick = () => {
    if (connectedVar) {
        ipc.send("disconnect");
    } else {
        ipc.send('connect', address);
    }
};

