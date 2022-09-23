:- use_module(library(lists)).
:- use_module(library(random)).
% needed for tau; accepted by swipl

:- dynamic(alphabet/1).
:- dynamic(namelist/1).
:- dynamic(used_name/1).
:- dynamic(used_id/1).

id_attempt_limit(5).

init_alphabet :- 
    atom_chars('abcdefghijklmnopqrstuvwxyz', List),  assertz(alphabet(List)), !.

letter(X) :-
    random(0, 25, Idx),
    alphabet(Alphabet),
    nth0(Idx, Alphabet, X).

generate_id_letters(Entity, Id, Len) :-
    nonvar(Len),
    nonvar(Entity),
    length(Letters, Len),
    maplist(letter, Letters),
    !,
    atomic_list_concat([Entity, '.'|Letters], '', Id), !.

generate_id(Entity, Id) :-
    generate_id_(Entity, Id, 6, 0), !.

generate_id(Entity, Id, Len) :-
    generate_id_(Entity, Id, Len, 0), !.

generate_id_(Entity, Id, Len, _) :-
    generate_id_letters(Entity, Id, Len),
    \+ used_id(Id),
    assertz(used_id(Id)),
    !.

generate_id_(Entity, Id, Len, AttemptsCnt) :-
    id_attempt_limit(Limit),
    (
	AttemptsCnt >= Limit,
	thr(['attempted id creations:', AttemptsCnt], 'Could not generate Id; too many attempts.'),
	  !
    ;
      NewCnt is AttemptsCnt + 1,
      generate_id_(Entity, Id, Len, NewCnt)
    ).
