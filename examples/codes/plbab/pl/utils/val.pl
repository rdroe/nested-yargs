
does_match_structure(PredName, Data) :-
    call(PredName, Data) , !
    ; thr([PredName, Data],
	  'Data does not match the structure prescribed by the predicate.').
