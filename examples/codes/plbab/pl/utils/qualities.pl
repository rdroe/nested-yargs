
edge_quality(r, ramps).
edge_quality(d, dirty).
edge_quality(t, turbulent).
edge_quality(c, confusing).
edge_quality(p, heavyPedestrians).


match(L,R) :- L == R, !.

% get route qualities
% NOTE: Quals does not match TryCnt length; some nulls are thrown out, if likelihood multiplier is > about 0.5 (which is hardcoded for this predicate to 1, yielding default 2).
qualities(TryCnt, Quals) :-
    choose_qualities_generic(TryCnt, RawQuals),
    exclude(match(null), RawQuals, Quals).

choose_qualities_generic(Cnt, RawQuals) :-
    base_quality_list(List),
    length(RawQuals, Cnt),
    !,
    maplist(choose_quality_in_list(List, 1), RawQuals).

add_quality(QualAbbrev, List, OutList) :-
    append([QualAbbrev], List, OutList).

base_quality_list(List) :- 
    findall(Q, edge_quality(Q, _), List).


quality_list_custom(Quality, IncreaseCnt, In, Out) :-
    length(Quals, IncreaseCnt),
    maplist(=(Quality), Quals),
    append(Quals, In, Out).


% likelihood is actually unlikelihood; and it is doubled by 2.
% it is the unlikelihood of anything being chosen at all.
% e.g. to make something definitely be chosen, set a Likelihood variable of 0.5. This is the likelihood of anything being chosen, so use choose quality custom to weight toward some quality.
choose_quality_in_list(Qs, Likelihood, Chosen) :-
    length(Qs, Tot),
    PoolCnt is (Likelihood * 2 * Tot) - 1, 
    PoolFlr is floor(PoolCnt),
    random(0, PoolFlr, ChosenAddr),
    nth0(ChosenAddr, Qs, Chosen), ! ; Chosen = null, !.

choose_quality_custom(Quality, IncreaseCnt, Likelihood, Chosen) :-
    base_quality_list(Base),
    quality_list_custom(Quality, IncreaseCnt, Base, CustomList),
    choose_quality_in_list(CustomList, Likelihood, Chosen).
