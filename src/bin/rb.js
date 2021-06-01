import yargs from 'yargs';
import fetch from 'isomorphic-fetch';
var argv = yargs
    .usage('Usage: $0 <command> [options]')
    .command('hello', 'Prints an option (default "hello world"')
    .options({
    option: {
        alias: 'o',
        description: 'Option',
        "default": 'hello world'
    }
})
    .argv;
var call = function (snt) {
    var arg = snt.split(' ').join('-');
    console.log('requesting for sentence ', arg);
    var path = "http://localhost:8080/brackets?snt=" + arg;
    console.log('isofetch');
    fetch(path).then(function (data) {
        console.log('data1', data);
        data.json().then(function (json) {
            console.log('data2', json);
            console.log(json);
        });
    });
};
if (argv && argv.option) {
    call(argv.option);
}
//# sourceMappingURL=rb.js.map