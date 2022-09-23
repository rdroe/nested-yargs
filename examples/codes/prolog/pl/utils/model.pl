:- dynamic(to_wipe_all/1).


prep_wipe_all(DynaTerm) :-

    term_list(DynaTerm, Nm, Args),
    length(Args, Ar),

    to_wipe_all(WipeList),

    (
	member(Nm-Ar, WipeList), !
    ;
      append([Nm-Ar], WipeList, NewList),
      retractall(to_wipe_all(_)),
      assertz(to_wipe_all(NewList))
    ),
    !.

wipe_pred_arity(Pred-Ar) :-
    length(Empty, Ar),
    term_list(Term, Pred, Empty),
    retractall(Term).

wipe_all :-
    to_wipe_all(WAList),
    maplist(wipe_pred_arity, WAList). 

model_event(Timing, Occasion, Term) :-
    term_list(Term, PredName, List),
    length(List, _),
    atomic_list_concat([Timing, Occasion, PredName], '_', UnsetFunctor),
    % for calling of event, pass arg list w/out pred name for now
    term_list(UnsetCallable, UnsetFunctor, [List]),
    (  current_predicate(UnsetFunctor/1),
       call(UnsetCallable),
       logt(events, 'Called', UnsetCallable)
       ;
       logt(events, 'Not calling', UnsetCallable, '(That event predicate does not exist)'),
       true
     ),
     !.


term_list(Term, PredName, List) :-
  =..(Term, [PredName|List]).

% unset eg network_name(goober) by calling model_unset(network_name(goober)).
model_unset(Term) :-
    logt(events, 'Model unset called', Term),    
    term_list(Term, _, ArgList),
    ( length(ArgList, 1), ! ; fail ),
    model_event(before, unset, Term),
    retractall(Term),
    logt(events, 'retractall called', Term),    
    model_event(after, unset, Term).

% unset e.g. netname_locations(planes, [bound, list]).
% unset all predicates so named where the first argument also matches (in addition to pred name)
model_unset(Term) :-
    logt(events, 'Model unset called (2)', Term),        
    term_list(Term, PredName, ArgList),
    ( length(ArgList, 2), ! ; fail ),
    model_event(before, unset, Term),    
    ArgList = [X, _],
    term_list(Retractable, PredName, [X|[_]]),
    model_event(after, unset, Term),
    retractall(Retractable),
    logt(events, 'retractall called (2)', Term).    

model_set(Term) :-
    logt(events, 'model set called for', Term),    
    model_event(before, set, Term),   
    model_unset(Term),
    asserta(Term),
    logt(events, 'asserta called for', Term),        
    model_event(after, set, Term),
    prep_wipe_all(Term)    
.

% set without first unsetting
model_set_two(Term) :-
    logt(events, 'model set two called for', Term),    
    model_event(before, set, Term),   
    model_unset_two(Term),
    asserta(Term),
    logt(events, 'asserta called for', Term),        
    model_event(after, set, Term),
    prep_wipe_all(Term)
.

% unset e.g. netname_locations(planes, [bound, list]).
% unset all predicates so named where the ARGUMENTS BOTH also matches (in addition to pred name)
model_unset_two(Term) :-
    logt(events, 'Model unset called (2)', Term),        
    term_list(Term, PredName, ArgList),
    ( length(ArgList, 2), ! ; fail ),
    model_event(before, unset, Term),    
    ArgList = [X, Y],
    term_list(Retractable, PredName, [X|[Y]]),
    model_event(after, unset, Term),
    retractall(Retractable),
    logt(events, 'retractall called (2)', Term).    
    
