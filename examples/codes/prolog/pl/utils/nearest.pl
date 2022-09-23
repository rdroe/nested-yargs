
pseudo_distance_indexed(
    [_, [X1, Y1, Z1]],
    [_, [X2, Y2, Z2]],
    PseudoDistance
) :-

    pseudo_distance([X1, Y1, Z1], [X2, Y2, Z2], PseudoDistance),
    !.

pseudo_distance([X1, Y1, Z1], [X2, Y2, Z2], PseudoDistance) :-
      is(Xsum, X2 - X1),
      is(Ysum, Y2 - Y1),
      is(Zsum, Z2 - Z1),
      is(Xsq, abs(Xsum)),
      is(Ysq, abs(Ysum)),
      is(Zsq, abs(Zsum)),
      is(PseudoDistance, Xsq + Ysq +Zsq),  !.

distance([X1, Y1, Z1], [X2, Y2, Z2], Dist) :-
      is(Xsum, X2 - X1),
      is(Ysum, Y2 - Y1),
      is(Zsum, Z2 - Z1),
      is(Xsq, Xsum * Xsum),
      is(Ysq, Ysum * Ysum),
      is(Zsq, Zsum * Zsum),
      is(Dist, sqrt(Xsq + Ysq + Zsq)), !.

% takes lists of lists(not pairs)
matching_index_items(ReturnableItems, MatchableItems, Matches) :-
    findall(
	Match,
	(
	    ( member([PossReturnableIdx, Dat], ReturnableItems),
	      member([PossReturnableIdx, _], MatchableItems),
	      Match = [PossReturnableIdx, Dat]
	    )
	),
	Matches), !.


nearest_n_indexes(N, Pt, NetName, NearestNetPoints) :-
    (nonvar(Pt), ! ; thr(Pt, 'variable "Pt" should be bound') ),
    (nonvar(NetName), ! ; thr(NetName, 'variable "NetName" should be bound') ),
    netname_locations_indexed(NetName, Net),
    nearest_in_indexed_list(N, Pt, Net, NearestNetPoints),
    !.

randomemb(X, Y) :- random_member(Y, X), !.

nearest_n_indexes_with_dist(N, Pt, NetName, NearestNetPointsWithDists) :-
    (nonvar(Pt), ! ; thr(Pt, 'variable "Pt" should be bound') ),
    (nonvar(NetName), ! ; thr(NetName, 'variable "NetName" should be bound') ),
    netname_locations_indexed(NetName, Net),
    nearest_in_indexed_list_with_dist(N, Pt, Net, NearestNetPointsWithDists), !.

    % feed in an indexed list (Net) and a pt.
    % get out a distance list.
nearest_in_indexed_list(N, Pt, Net, NearestNetPoints) :-
    maplist(
	pseudo_distance_indexed(Pt), Net, Dists
    ),
    index_list(Dists, IndexedDists),
    value_key_pairs(IndexedDists, DistsForKeys),
    keysort(DistsForKeys, Sorted),
    first_n(N, Sorted, NearestNPairs),
    pairs_values(NearestNPairs, NearestNetPoints),
    !.

nearest_in_indexed_list_with_dist(N, Pt, Net, NearestNetPoints) :-

    maplist(pseudo_distance_indexed(Pt), Net, Dists),
    index_list(Dists, IndexedDists),
    value_key_pairs(IndexedDists, DistsForKeys1),
    maplist(simple_add_elem, DistsForKeys1, DistsForKeys),
    keysort(DistsForKeys, Sorted),
    first_n(N, Sorted, NearestNPairs),
    
    pairs_values(NearestNPairs, NearestNetPoints), !.


simple_add_elem(Key-Val, Key-[Val, Key]).


nearest(Pt, NetName, NearestPtWithIdx) :-
    (nonvar(Pt), ! ; thr(Pt, 'variable "Pt" should be bound') ),
    (nonvar(NetName), ! ; thr(NetName, 'variable "NetName" should be bound') ),
    netname_locations(NetName, Net),
    maplist(pseudo_distance(Pt), Net, Dists),
    index_list(Dists, IndexedDists),
    min_nth(1, IndexedDists, NearestPtWithIdx).

pseudo_distance_data(StartPoint, DestPoint, Out) :-
    pseudo_distance(DestPoint, StartPoint, Dist),
    Out = [DestPoint, Dist].

mapdists(AllNetTwoPoints, NetOnePoint, DistList) :-
    maplist(pseudo_distance_data(NetOnePoint), AllNetTwoPoints, DistList).

netname_dist_map(NetName1, NetName2, DistMap) :-
    % look up networks.
    % hold net 1 up to each in net 2, getting distance
    netname_locations(NetName1, Net1),
    netname_locations(NetName2, Net2),
    % For every point in Net1, get all distances to Net2
    maplist(mapdists(Net2), Net1, DistMap).


quicktest_nearest(Pt, NetName, Nearest) :-
    (var(Pt), ! ; thr(Pt, 'variable "Pt" should be unbound') ),
    (nonvar(NetName), ! ; thr(NetName, 'variable "NetName" should be bound') ),
    generate_surface_location(3.5, [0, 0, 0], Pt),
    netname_locations(NetName, Net),
    netname_locations_indexed(NetName, IndexedNet),
    maplist(pseudo_distance(Pt), Net, Dists),
    index_list(Dists, IndexedDists),
    min_nth(1, IndexedDists, [IdxNearest, _]), % 57.xxx
    nth0(IdxNearest, IndexedNet, Nearest).

% takes 
n_connections_lookup(XNetname, YNetname, N, NearestMap) :-
    n_connections_lookup(nearest_n_indexes, XNetname, YNetname, N, NearestMap), !.

n_connections_lookup(
    PredArity4,
    XNetname,
    YNetname,
    N,
    NearestMap
) :-
    (
	is_valid_connections_algo(PredArity4),
	! ;
	thr(PredArity4, 'A valid connections algo predicate is required')
    ),
    netname_locations_indexed(XNetname, XList),

    maplist(map_nearest(PredArity4, N, YNetname), XList, NearestMap).

map_nearest(PredArity4, N, YNetname, [XIdx, XPt], [XIdx, NearestN]) :-
    call(PredArity4, N, [XIdx, XPt], YNetname, NearestN).
