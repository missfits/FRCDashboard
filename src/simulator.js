function sendValues() {
    if (testing) {
        ui.simulatorButton.innerHTML = "Test Mode";
        ui.selectorBox.innerHTML = "";
        ui.booleanBox.innerHTML = "";
        ui.printoutBox.innerHTML = "";
        testing = false;
    } else {
        ui.simulatorButton.innerHTML = "Exit Test";
        testing = true;
        NetworkTables.putValue("/SmartDashboard/testString1", "hi");
        NetworkTables.putValue("/SmartDashboard/testNum1", 420);
        NetworkTables.putValue("/SmartDashboard/testChooser1/default", "Dog");
        NetworkTables.putValue("/SmartDashboard/testChooser1/options", ["Cat", "Dog"]);
        NetworkTables.putValue("/SmartDashboard/testChooser2/default", "Tobey Maguire");
        NetworkTables.putValue("/SmartDashboard/testChooser2/options", ["Tobey Maguire", "Andrew Garfield", "Tom Holland"]);
        NetworkTables.putValue("/SmartDashboard/testNum2", 4.20);
        NetworkTables.putValue("/SmartDashboard/testString2", "The Great Gatsby");
        NetworkTables.putValue("/SmartDashboard/testBool1", true);
        NetworkTables.putValue("/SmartDashboard/testBool2", false);
        NetworkTables.putValue("/RaspberryPi/Vision Mode", true);
        NetworkTables.putValue("/RaspberryPi/Contour Number", 3);
    }
}