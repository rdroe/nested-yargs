:- use_module(library(lists)).

% validate
is_valid_location([X, Y, Z]) :-
    number(X),
    number(Y),
    number(Z).


% generate a point on the surface of the sphere specified.
    
generate_surface_location(Radius, [OriginX, OriginY, OriginZ], [X, Y, Z]) :-
    var(X), var(Y), var(Z),
    number(OriginX), number(OriginY), number(OriginZ),
    number(Radius),
    random(0.0, 1.0, U),
    random(0.0, 1.0, V),
    is(Pi, pi),
    is(Theta, (2 * Pi * U)),
    is(PhiArg, ( (2 * V) - 1)), 
    is(Phi, (acos(PhiArg))),
    is(PhiSin, sin(Phi)),
    is(ThetaCos, cos(Theta)),
    is(ThetaSin, sin(Theta)),
    is(PhiCos, cos(Phi)),
    is(X, OriginX + (Radius * PhiSin * ThetaCos)),
    is(Y, OriginY + (Radius * PhiSin * ThetaSin)),
    is(Z, OriginZ + (Radius * PhiCos)).


% generate a point on the surface of the sphere specifized.
generate_location(Radius, Origin, Out) :-
    FloatRadius is float(Radius),
    random(0.0, FloatRadius, RandRadius),
    generate_surface_location(RandRadius, Origin, Out).

% validate
is_valid_location_list(List) :-
    maplist(is_valid_location, List).

% generate
generate_surface_location_list(Destinations, Length, Radius, [OriginX, OriginY, OriginZ]) :-
    var(Destinations), !,
    (nonvar(Length), number(Length), ! ; random(2, 4, Length) ),
    length(Destinations, Length),
    
    % fill the list of empty vars with skyports; length was randomly chosen above.
    % uses generate_location(Radius, [OriginX, OriginY, OriginZ], [X,Y,Z]) :-

    maplist(generate_surface_location(Radius, [OriginX, OriginY, OriginZ]), Destinations).

% generate 2 - 4 points inside a sphere
generate_location_list(Destinations, Length, Radius, [OriginX, OriginY, OriginZ]) :-
    var(Destinations), !,
    (nonvar(Length), number(Length), ! ; random(2, 4, Length) ),
    length(Destinations, Length),
    
    % fill the list of empty vars with skyports; length was randomly chosen above.
    % uses generate_location(Radius, [OriginX, OriginY, OriginZ], [X,Y,Z]) :-

    maplist(generate_location(Radius, [OriginX, OriginY, OriginZ]), Destinations).


% below works in swipl, not tau.
/*
    maplist(
	[Out]>>generate_location(Radius, [OriginX, OriginY, OriginZ], Out), Destinations).

*/
