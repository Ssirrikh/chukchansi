
// axis has val from [-1,1]
	// given source nudges value by some amount
	// repeated nudges from same source quickly build tolerance (have less and less effect)
	// tolerance decreases slowly over time

// entity has:
	// personality heuristic (baseline tendencies [possibly immutable])
	// emotional state heuristic (changed by instantaneous events, governs instantaneous reactions)
	// FOR EACH RELATIONSHIP:
		// perception heuristic, aka expectations of behavior (changed if wrong, govern plans)
		// [entity has good relationship when pereption heuristic re: other aligns with personality heuristic of self]
	

let axis = {
	value: 0.0,

	top: 'Brave',
	bot: 'Cowardly',

	resist: 0.5,
	damping: 0.001,

	recentInfluences: {
		'gunshots': {

		}
	},

	nudge: (source,amount) => {
		if (!this.recentInfluences[source]) this.recentInfluences[source] = {};
	}
};