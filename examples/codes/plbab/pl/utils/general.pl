:- dynamic(do_log/1).
% logging 
% do_log(develop) is usually dynamic.
nolog :- retractall(do_log(develop)).
% do_log(events).
% do_log(test).

do_log(nil).
do_log(report).

writelog(Msg) :- write(Msg), write(' ').
report(MsgList) :- is_list(MsgList), maplist(writelog, MsgList), !.
report(Msg) :- \+ is_list(Msg), writelog(Msg), !.

log_scoped(report, Msgs) :-
    ( do_log(report),
      maplist(report, Msgs), nl, !
    ; true), !.

log_scoped(Scope, Msgs) :-
    Scope \= report,
    ( do_log(Scope),
      maplist(writelog, Msgs), nl
    ; true), !.

log(Msg1, Msg2, Msg3) :- log_scoped(develop, [Msg1, Msg2, Msg3]). 
logt(Msg) :- log_scoped(test, [Msg]).
logt(Msg1, Msg2) :- log_scoped(test, [Msg1, Msg2]).
logt(Msg1, Msg2, Msg3) :- log_scoped(test, [Msg1, Msg2, Msg3]).
logt(Msg1, Msg2, Msg3, Msg4) :- log_scoped(test, [Msg1, Msg2, Msg3, Msg4]).
logt(Msg1, Msg2, Msg3, Msg4, Msg5) :- log_scoped(test, [Msg1, Msg2, Msg3, Msg4, Msg5]).

logd(Msg) :- log_scoped(develop, [Msg]).
logd(Msg1, Msg2) :- log_scoped(develop, [Msg1, Msg2]).
logd(Msg1, Msg2, Msg3) :- log_scoped(develop, [Msg1, Msg2, Msg3]).
logd(Msg1, Msg2, Msg3, Msg4) :- log_scoped(develop, [Msg1, Msg2, Msg3, Msg4]).
logd(Msg1, Msg2, Msg3, Msg4, Msg5) :- log_scoped(develop, [Msg1, Msg2, Msg3, Msg4, Msg5]).

logr(Msg) :- log_scoped(report, ['>', Msg]).
logr(Msg1, Msg2) :- log_scoped(report, ['>', Msg1, Msg2]).
logr(Msg1, Msg2, Msg3) :- log_scoped(report, ['>', Msg1, Msg2, Msg3]).
logr(Msg1, Msg2, Msg3, Msg4) :- log_scoped(report, ['>', Msg1, Msg2, Msg3, Msg4]).
logr(Msg1, Msg2, Msg3, Msg4, Msg5) :- log_scoped(report, ['>', Msg1, Msg2, Msg3, Msg4, Msg5]).


logd_sample(List, Msg) :-
    first_n(4, List, Sample),
    maplist(logd(Msg), Sample).

logd_sample(List, Msg, N) :-
    first_n(N, List, Sample),
    maplist(logd(Msg), Sample).

rpt(List, Msg) :-
    logr(Msg, ':::: :'),
    maplist(logr, List).

logr_sample(List, Msg) :-
    first_n(4, List, Sample),
    maplist(logr(Msg), Sample).

logr_sample(List, Msg, N) :-
    first_n(N, List, Sample),
    maplist(logr(Msg), Sample).



indexed_item(Elem1, Elem2, [Elem1, Elem2]).

% put an index in front of every item in a list
% eg, [1, 2, 3] is [[0,[1]], [1, [2]], [2, [3]]]
index_list(List, IndexedList) :-
    ( var(IndexedList), ! ; thr('IndexedList must be unbound') ),
    length(List, ListLen),
    IdxNeed is ListLen - 1,
    findall(N, between(0, IdxNeed, N), Idxs),
    maplist(indexed_item, Idxs, List, IndexedList), !.


min_nth_iter(_, First, Var, FirstChamp) :-
    var(Var),
    FirstChamp = First, !.
    
min_nth_iter(Nth, Elem, CurrChamp, NewChamp) :-
    nth0(Nth, Elem, CurrElem),
    nth0(Nth, CurrChamp, ChampElem),
    CurrElem < ChampElem,
    NewChamp = Elem,
    logd('new champ; [winner, loser]', [Elem, CurrChamp]),
    !.

min_nth_iter(Nth, Elem, CurrChamp, CurrChamp) :-
    nth0(Nth, Elem, CurrElem),
    nth0(Nth, CurrChamp, ChampElem),
    CurrElem > ChampElem,
    logd(' champ wins again; [winner, loser]', [CurrChamp, Elem]),
    !.

% List is a List of lists.
% Based on the nth element, find the least of them
min_nth(Nth, List, Elem) :-  
    foldl(min_nth_iter(Nth), List, _, Elem). 

% true if ValKeyList unifies with V-K
value_key_pair([K, V], ValKeyList) :-
    var(ValKeyList),
    ValKeyList = '-'(V, K), !.

value_key_pair([K, V], Pair) :-
    nonvar(Pair),
    term_list(Pair, Hyphen, [V, K]),
    ( Hyphen == '-', ! ; thr(Hyphen, 'Should have been a hyphen, if appropriate to value_key_pair utility')), !.

% convert e.g. [ [a,b], [c,d] ] into [ b-a, d-c ]]
% that is, second elements become keys in the pairs
value_key_pairs(KVLists, ValKeyPairs) :-
    maplist(value_key_pair, KVLists, ValKeyPairs).

first_n(N, Src, Src) :- length(Src, SrcLen), N >= SrcLen, !.
first_n(N, Src, Out) :- findall(E, (nth1(I, Src, E), I =< N), Out).

% kind of a tau polyfil, kind of not.
pred_arity_exists(PredName, Arity) :-
    current_predicate(X),  X =.. ['/', PredName, Arity].    

is_valid_connections_algo(PredName) :-
    nonvar(PredName),
    pred_arity_exists(PredName, 4), !.

% replace a list element with another (old, new, list, output list)
replace_gr(_, _, [], []).
replace_gr(O, R, [O|T], [R|T2]) :- replace_gr(O, R, T, T2).
replace_gr(O, R, [H|T], [H|T2]) :- H \= O, replace_gr(O, R, T, T2).


split_list(_, [], [], []) :- !.
split_list(X, [], _, _) :- X < 0, !.

split_list(HeadListLen, HeadList, Rest, Full) :-
    length(Full, FullLength),
    ( HeadListLen =< FullLength , !
      ; thr(['full list, len', Full, HeadListLen], 'Requested headlist is not appropriate length compared to full list')
    ),
    ( is_list(Full), !
      ; thr(['var', Full], 'for split_list, last arg should be a list')
    ),
    length(HeadList, HeadListLen),
    append(HeadList, Rest, Full), !.

sublist(Full, [Start, Len], Sublist) :-
    length(Full, FullLength),
    is(Tot, Start + Len),
    (
      Tot =< FullLength
      , Start < FullLength
      ,!
      ; thr(['Total sought len and full len', Tot, FullLength], 'Requested sublist is not shorter than the full list')
    ),
    ( is_list(Full), !
      ; thr(['var', Full], 'for sublist, last arg should be a list')
    ),
    split_list(Start, _, Rest, Full),
    split_list(Len, Sublist, _, Rest), !.


divide_list(SublistCnt, Lists, FullList) :-
    length(FullList, FullLen),
    is(SubLenPre, FullLen / SublistCnt),
    is(SubLen, ceiling(SubLenPre)),
    is(ModDiff, mod(FullLen, SublistCnt)),    
    findall(
	N,
	(
	    between(1, SublistCnt, N)

	),
	Between
    ),
    write([between, Between]),
    findall(
	    [St, Sl],
	    (

		member(N, Between),
		is(End, N * SubLen),
		is(St, End - SubLen),
		(   
		    ModDiff == 0,
		    is(Sl, SubLen)
		    ; 
		    N < SublistCnt,
		    is(Sl, SubLen)
		    ;
		    ModDiff \= 0,
		    N == SublistCnt,
		    is(Sl, FullLen - St)
		)
	    ),
	    Plan
        ),
    !,
    writeln(Plan),
    maplist(sublist(FullList), Plan, Lists).
	
    


intersection_util(AllJourneys, [[PiName, _-route_data(_, NameList)]], In, Out):-
    maplist(intersection_subutil(PiName, NameList), AllJourneys, ICnts),
    append(ICnts, In, Out),
    !.

intersection_subutil(
    OwnPiName, NameList,
    [[OtherPiName, _-route_data(_,OtherList)]],
    IntersectionCnt
) :-
    (
	OwnPiName == OtherPiName, IntersectionCnt = 0, ! ; 
	intersection(NameList, OtherList, Intersection),
	length(Intersection, IntersectionCnt)
    ).
