const bracketsRegex = /(\()|(\))/gm;

class StringParser {
  constructor(string) {
    this.lines = [];
    this.makros = {};
    this.steps = [];
    this.serializeString(string);
  }

  getSteps() {
    return this.steps;
  }

  serializeString(string) {
    const clearRegex = /(?<!define )is/gm;
    string = string.replace(bracketsRegex, val => '(' === val ? '("' : '")');
    string = string.replace(clearRegex, ':');
    string = string.replace(/\,{1}\s{1}/gm, '","');
    this.lines = string.trim().match(/^.{1,}/gm).map(item => item.replace(/\s+/gm, ''));
    this.lines.filter(line => line.indexOf('define') > -1).forEach(line => this.parseDefine(line));
    this.lines.filter(line => line.indexOf('define') === -1).forEach(line => this.parsePlay(line))
  }

  parseDefine(line) {
    line = line.replace('define', '');
    const [defName, defQuery] = line.split(':');
    this.makros[defName] = defQuery.split('|');
  }

  parsePlay(line) {
    line = line.replace('play', '');
    const steps = line.split('|');
    this.parseSteps(steps);
  }

  parseSteps(stepsArray) {
    stepsArray.forEach(step => {
      if (step.indexOf('repeat') > -1) {
        step = step.replace('repeat', '');
        const countRegex = /^\d+/gm;
        const count = parseInt(step.match(countRegex)[0]);
        step = step.replace(/^\d+times/gm, '');
        this.parseSteps(new Array(count).fill(null).map(() => step));
      } else if (step.match(bracketsRegex)) {
        eval(`this.${step}`);
      } else {
        if (this.makros[step]) {
          this.parseSteps(this.makros[step]);
        }
      }
    })
  }

  note(notes, duration) {
    this.steps.push({
      notes: notes.split(';'),
      duration
    });
  }

  pause(duration) {
    this.steps.push({duration})
  }
}

module.exports = StringParser;
