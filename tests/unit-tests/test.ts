import 'ts-jest';
import {colorCheck} from '../../src/resources/embedColorCheck'

test('check that the color of a default command is #FFFFFF', () => {
    expect(colorCheck('938519232155648011',false)).toBe('#FFFFFF');
});

test('check that the color of a music command is BLUE', () => {
    expect(colorCheck('938519232155648011',true)).toBe('#BLUE');
});

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});

function sum(a:number, b:number) {
    return a + b;
}