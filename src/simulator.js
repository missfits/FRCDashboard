function sendValues() {
    NetworkTables.putValue("/SmartDashboard/testString1", "hi");
    NetworkTables.putValue("/SmartDashboard/testNum1", 420);
    NetworkTables.putValue("/SmartDashboard/testChooser1/default", "Dog");
    NetworkTables.putValue("/SmartDashboard/testChooser1/options", ["Cat", "Dog"]);
    NetworkTables.putValue("/SmartDashboard/testChooser2/default", "Tobey Maguire");
    NetworkTables.putValue("/SmartDashboard/testChooser2/options", ["Tobey Maguire", "Andrew Garfield", "Tom Holland"]);
    NetworkTables.putValue("/SmartDashboard/testNum2", 4.20);
    NetworkTables.putValue("/SmartDashboard/testString2", "The Great Gatsby is an unrequited gay love story & y'all can fight me on this");
    NetworkTables.putValue("/SmartDashboard/testBool1", true);
    NetworkTables.putValue("/SmartDashboard/testBool2", false);
}