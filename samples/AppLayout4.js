enyo.kind({
	name: "enyo.sample.AppLayout4",
	kind: "HFlexBox",
	components: [
		{kind: "VFlexBox", classes: "fittable-sample-shadow4", flex: 1, style: "z-index: 1;", components: [
			{flex: 1},
			{flex: 1},
			{flex: 3},
			{kind: "onyx.Toolbar", style: "height: 57px;", components: [
				{content: "Toolbar"}
			]}
		]},
		{kind: "VFlexBox", flex: 2, components: [
			{flex: 1, classes: "fittable-sample-fitting-color"},
			{kind: "onyx.Toolbar", style: "height: 57px;",components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]}
	]
});
