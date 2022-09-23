:- use_module('pl/modules/dijkstra_av').
:- initialization(server_init).

server_init :-
    assertz(do_log(develop)),
    assertz(to_wipe_all([])),
    consult('pl/utils/id'),
    consult('pl/utils/val'),
    consult('pl/utils/thr'),
    consult('pl/utils/model'),
    consult('pl/utils/general'),
    init_alphabet.
