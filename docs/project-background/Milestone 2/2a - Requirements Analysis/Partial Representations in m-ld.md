_Adapted from an email from Benoit Grégoire, Wed, 8 Feb, 03:18_

## problem statement

<u>How to handle partial representations in m-ld</u>

My understanding is that in **m-ld**, every clone converges on the same graph, which all parties will eventually get a complete representation of.

In Tiki, for a given tracker there IS a high level schema shared by all end users (which is the list and definition of all fields of a given tracker).  But any single user only has access to a unique subset of the fields AND items stored in a Tiki instance.  So even if the domain is a specific tracker item, the representation each user need will be different.  Data for fields they do not have access to (in general or for that item) must not leak. 

I simply do not see conceptually when in our case the local set of data of any two random pair of users is ever expected to converge to the exact same graph.  If the server has to maintain a different graph for each currently connected user, it obviously won't scale.

This sentence is on the **m-ld** site "Clones which do not store all the data locally are the subject of active  research. A proposal document for this feature will shortly be available  in this portal."  I am obviously looking forward to seeing it, but I'm not sure it tackles the same problem, or something more akin to lazy-loading.

Basically, is it theoretically possible for all users to have a clone representing the same structure, but a different subsets of the data?  And for **m-ld** operations to work between them?

<u>Assuming a solution to the above</u>

If we are not to use **m-ld** as a glorified message queue, and actually act on the user changing a local clone in Tiki, how do we propagate errors, especially access denied errors to the user?  I guess it's a form of conflict, but resolving it may require transmitting context only the server has.  However the server provides it, the UX has to have a way of tying it back to the original attempted change.  The documentation is a little vague on the actual mechanics of conflict resolution.

