"use strict";

var calculator = {
  //map document ID names to operators shown:
  ops: { minus: "-", plus: "+", slash: "/", times: "*" },
  //map operators to functions that calculate them (avoid eval):
  op_functions: {
    "-": function _(a, b) {
      return a - b;
    },
    "+": function _(a, b) {
      return a + b;
    },
    "/": function _(a, b) {
      return a / b;
    },
    "*": function _(a, b) {
      return a * b;
    }
  },
  state: {
    current: "",
    stored: null,
    operator: null,
    last_operator: null,
    last_operand: null,
    disable_input: false },
  //disables numbers, decimal, and the '%' operator when an answer is shown
  update: function update(message) {
    if (message) {
      document.getElementById("screen").innerText = message;
      return;
    }
    document.getElementById("screen").innerText = this.state.current;
  },
  clear: function clear() {
    this.state.operator = null;
    this.state.current = "";
    this.state.stored = null;
    this.state.disable_input = false;
    this.update();
  },
  calc: function calc() {
    var c = this.state;
    if (c.current === "") {
      return;
    }
    //if we have no stored operand:
    if (c.stored === null) {
      //if we have a complete operation in memory (last_operator and last_operand) and no current operator
      if (!c.operator && c.last_operator && c.last_operand) {
        //re-apply stored operation to c.current
        c.operator = c.last_operator;
        c.stored = c.current;
        c.current = c.last_operand;
      } else {
        return; //exit if there was no stored operation
      }
    }
    var a = Number(c.stored);
    var b = Number(c.current);
    var answer = this.op_functions[c.operator](a, b);
    c.last_operator = c.operator;
    c.last_operand = c.current;
    //round num to 12 decimal places (returns a string) then cast back to a Number - strips trailing 0s
    //e.g. 0.30000000000004 -> "0.30000000000" -> 0.3
    var formatted_answer = Number(answer.toPrecision(12));
    c.current = formatted_answer + "";
    c.stored = null;
    c.operator = null;
    c.disable_input = true;
    this.update();
  },
  add_number: function add_number(val) {
    if (val == "0" && this.state.current == "0") {
      return;
    }
    if (this.state.disable_input) {
      this.clear();
    }
    this.state.current += val;
    this.update();
  },
  add_operator: function add_operator(op_name) {
    var c = this.state;
    var op = this.ops[op_name];
    if (!c.current) {
      if (op == '-') {
        this.add_number('-');
      }
      return;
    }
    if (c.operator) {
      this.calc();
    }
    c.stored = c.current;
    c.current = "";
    c.operator = op;
    c.disable_input = false;
    this.update(c.stored + op);
  },
  add_decimal: function add_decimal() {
    var c = this.state;
    if (c.disable_input) {
      this.clear();
    }
    if (c.current == "") {
      c.current = "0.";
    } else if (c.current.indexOf(".") != -1) {
      return;
    } else {
      c.current += ".";
    }
    this.update();
  },
  take_percent: function take_percent() {
    var c = this.state;
    if (c.disable_input || !c.current) {
      return;
    }
    c.current = Number(c.current) / 100 + "";
    this.update();
  },
  init: function init() {
    var buttons = document.getElementsByClassName("button");
    [].forEach.call(buttons, function (button) {
      var id = button.id;
      if (!isNaN(Number(id))) {
        button.addEventListener("click", calculator.add_number.bind(calculator, id));
      } else if (id in calculator.ops) {
        button.addEventListener("click", calculator.add_operator.bind(calculator, id));
      } else if (id == 'dot') {
        button.addEventListener("click", calculator.add_decimal.bind(calculator));
      } else if (id == 'C' || id == 'AC') {
        button.addEventListener("click", calculator.clear.bind(calculator));
      } else if (id == 'eq') {
        button.addEventListener("click", calculator.calc.bind(calculator));
      } else if (id == 'percent') {
        button.addEventListener("click", calculator.take_percent.bind(calculator));
      }
    });
  }
};
window.onload = calculator.init.bind(calculator);
