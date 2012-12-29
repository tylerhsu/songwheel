var fs = require('fs');
var util = require('util');

// Node class
// Each Node represents 1/16th of a measure.
// A node's data is an array of integers where 1-12 represent notes of
// the scale starting with A, and 0 represents a rest. Thus a node
// containing [4, 8, 11] represents a C major chord.
// Sequenced into a queue, these nodes make up the entire staff.
var Node = function(data) {
    data = data || [];
    var node = {
        data: data
    };
    return node;
};

// NoteQueue class
// A queue of Node objects which describe a sequence of notes to be played.
// Constructor accepts the name of a midi file to use as input.
var NoteQueue = function(filename) {
    this.head = this.tail = null;
    this.length = 0;
};

NoteQueue.prototype.parseMidi = function(filename, callback) {
    fs.readFile(filename, function(err, data) {
        callback(data);
    });
};

NoteQueue.prototype.push = function(data) {
    if (!util.isArray(data)) {
        throw new Error("Expected an array");
    }
    var node = new Node(data);
    // first node?
    if (!this.head) {
        this.head = node;
    } else {
        this.tail.next = node;
    }
    this.tail = node;
    return ++this.length;
};

NoteQueue.prototype.pop = function() {
    if (this.length == 0) {
        return null;
    }
    var temp = this.head;
    this.head = this.head.next;
    this.length--;
    if (this.length == 0) {
        this.tail = null;
    }
    return temp.data;
};

// TestNoteQueue class
// preset note queue for testing
var TestNoteQueue = function() {
    this.push([1]);
    this.push([0]);
    this.push([0]);
    this.push([0]);
    this.push([1]);
    this.push([0]);
    this.push([0]);
    this.push([0]);
    this.push([1]);
    this.push([0]);
    this.push([0]);
    this.push([0]);
    this.push([1]);
};

TestNoteQueue.prototype = new NoteQueue();

exports.NoteQueue = NoteQueue;
exports.TestNoteQueue = TestNoteQueue;