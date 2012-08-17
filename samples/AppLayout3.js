enyo.kind({
	name: "enyo.sample.AppLayout3",
	kind: "HFlexBox", 
	components: [
		{kind: "VFlexBox", flex: 2, components: [
			{flex: 1, classes: "fittable-sample-fitting-color"},
			{classes: "fittable-sample-shadow3", flex:1},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "1"}
			]}
		]},
		{kind: "VFlexBox", classes: "fittable-sample-shadow", flex: 1, components: [
			{flex: 1},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]}
	]
});
