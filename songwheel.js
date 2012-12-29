// songwheel.js
// This module contains the classes that operate the songwheel.
// This operation is based on the concept of three entities:
// 1.) A metronome, or authoritative timekeeper that drives the simulation.
// In our case absolute timing is irrelevant; this class keeps time based on 
// the position of the songwheel (derived from an encoded motor).
// 2.) The instrument itself -- this is simply an interface for
// manipulating/actuating the instrument.
// 3.) A 'musician', or the logical controller whose job it is to
// actuate the instrument given a musical score and a source of
// timing information.
//

var util = require('util');
var events = require('events');

// Metronome class
// Watches the motor's position and emits a tick
// each time the appropriate increment has passed.
exports.Metronome = function(motor) {
    this.motor = motor;
    this.callbacks = [];

    // Executes every time the motor posts a 'moved' event.
    // See if the motor has reached a ticking point, and if it has,
    // count off a beat.
    this.watchMotor = function(position) {
        if (position >= this.nextTick && position <= 330) {
            this.tick();
        }
    };

    this.start = function() {
        this.nextTick = this.motor.position - (this.motor.position % 30) + 30;
        this.motor.on("moved", this.watchMotor.bind(this));
    };

    this.stop = function() {
        this.motor.removeListener("moved", this.count);
    };

    // emit tick event
    this.tick = function() {
        this.emit("tick", this.motor.position);
        this.nextTick = (this.nextTick + 30) % 360;
        util.debug("Tick, time = " + this.motor.time + ", position = " + this.motor.position);
    };
};
exports.Metronome.prototype = events.EventEmitter.prototype;

// Motor class
exports.Motor = function(bpm) {
    this.bpm = bpm;

    // absolute time in milliseconds.
    this.time = 0;

    // axle position in degrees (mod 360)
    this.position = 0;

    // update interval in milliseconds
    this.interval = 25;

    // Increment motor position and emit an event telling about it.
    this.move = function() {
        this.time += this.interval;
        var degrees = this.bpm * 4 / 60 / 1000 * 30 * this.interval;
        this.position = (this.position + degrees) % 360;
        this.emit("moved", this.position);
    };

    // Start the motor moving.  We 'move' the motor
    // by incrementing this.position at an arbitrary interval.
    // We can increment by a constant amount, or by a variable
    // amount to simulate an imperfect rate of rotation.
    this.start = function() {
        if (this.intervalId) {
            util.debug("Already started");
        } else {
            this.intervalId = setInterval(this.move.bind(this), this.interval);
        }
        return this.intervalId;
    };

    // Stop ticking
    this.stop = function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = null;
    };
};
exports.Motor.prototype = events.EventEmitter.prototype;

exports.Instrument = function() {

    // actuate one of the picks 1-12
    this.actuate = function(pick) {
        console.log("actuated pick #" + pick);
    };

    // Returns the number of the pick that the given position
    // will pass next.
    this.nextPick = function(position) {
        return Math.floor(position / 30) + 1;
    };

    this.notePosition = function(note) {
        return note * 30 - 30;
    };

    this.pickPosition = function(pick) {
        return pick * 30 - 30;
    };
};

exports.Musician = function(noteQueue, metronome, instrument) {
    this.noteQueue = noteQueue;
    this.metronome = metronome;
    this.instrument = instrument;

    this.play = function() {
        this.metronome.on("tick", this.playNote.bind(this));
    };

    this.playNote = function(motorPosition) {
        var note = this.noteQueue.pop();
        var noteLocation;
        if (!note) {
            this.stop();
        } else if (note != 0) {
            noteLocation = motorPosition + this.instrument.notePosition(note);
            this.instrument.actuate(this.instrument.nextPick(noteLocation));
        }
    };

    this.stop = function() {
        this.metronome.removeListener("tick", this.playNote.bind(this));
    };
};

exports.run = function(noteQueue, callback) {
    var motor = new exports.Motor(60);
    var metronome = new exports.Metronome(motor);
    var instrument = new exports.Instrument();
    var musician = new exports.Musician(noteQueue, metronome, instrument);
    motor.start();
    metronome.start();
    setTimeout(musician.play.bind(musician), 1000);
};