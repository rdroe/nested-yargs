

call_create_term(Pred, Elem, Pair) :-
   term_list(Callable, Pred, [Elem]),
   call(Callable, Ans),
   Pair = '-'(Ans, Elem), !.

pair_value(Pair, Val) :-
  term_list(Pair, '-', [_, Val]).
  
pairs_values(KVPairs, Values) :-
   maplist(pair_value, KVPairs, Values).

map_list_to_pairs(Pred, List, Out) :-
   maplist(call_create_term(Pred), List, Out).

sort_atoms_by_length(Atoms, ByLength) :-
        map_list_to_pairs(atom_length, Atoms, Pairs),
        keysort(Pairs, Sorted),
        pairs_values(Sorted, ByLength).


atom_number(Atomic, X)
   :-  atom_chars(Atomic, NumChars), number_chars(X, NumChars).
