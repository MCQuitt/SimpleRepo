TestPlugin = {
  echoResults: function(pole) {
    // Best do this in the function, not globally, as it will be a different model if user switches projects.
    var model = Neara.getModel();

    console.log('Waiting for any calculations to complete...');

    function readResult() {
      return pole.getUScenarioDistribution().getUSummaryIcons();
    }

    // The wait() function waits for any pending calculations.
    // NOTE: wait() will only wait for calculations the Neara app knows about, based on what fields are visible.
    // So this currently will not actually wait for the desired result if not visible in a report somewhere.
    // We will add more features to allow waiting for specific calculations to finish.
    // E.g. model.wait([list of things to wait for ])
    var promise = model.wait().then(function(_) {
      console.log('Wait over');
      pole.setUTestField("Got result: " + readResult());
    }, function (err) {
      console.error("Received error", err);
    });

    // If we return a promise, Neara will show a spinner on the clicked button.
    return promise;
  },

  makeLineOfPoles: function(startPole) {
    var model = Neara.getModel();

    if (startPole.getAssemblies().length > 0) {
      return Neara.alert("Can only make line starting from blank pole");
    }

    var lineOfPoles = [startPole];
    for (var i = 1; i < 10; i++) {
      var pole = model.createPole(startPole.getLocation().add({x: 20 * i}));
      pole.setType(startPole.getType());
      lineOfPoles.push(pole);
    }
    var section = model.createStrainSection(lineOfPoles);
    section.setCableCount(3);

    // Find any "interesting" assembly type
    var type = model.getAssemblyLibrary().filter(function(type) {
      return type.getCableCounts() == '(3)' && type.getCrossarmCount() >= 1;
    })[0];

    for (var assy of section.getAssemblies()) {
      assy.setType(type);
    }

    lineOfPoles[0].addStay();
    lineOfPoles[9].addStay();

    var cameraTarget = lineOfPoles[9].getTop();
    var cameraOffset = lineOfPoles[0].getTop().subtract(cameraTarget).add({z: 30, y: 40}).scale(2.0);

    Neara.editor.perspectiveView.lookAt(cameraTarget, cameraOffset);
  },
}


Neara.setPermittedPluginFunctions([
  'TestPlugin.echoResults',
  'TestPlugin.makeLineOfPoles',
]);