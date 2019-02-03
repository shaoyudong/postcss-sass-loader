const compiler = require('./compiler');

describe('sass-loader', () => {
    test('base', async() => {
        const stats = await compiler('./sass/main.scss');
        const output = stats.toJson().modules[0].source;
        expect(output).toBe('module.exports = \".test {\\n  roloc: lightblue;\\n}\"');
    });
});