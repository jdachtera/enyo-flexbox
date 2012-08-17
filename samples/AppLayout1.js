enyo.kind({
	name: "enyo.sample.AppLayout1",
	kind: "VFlexBox", 
	components: [
		{kind: "onyx.Toolbar", components: [
			{content: "Header"},
			{kind: "onyx.Button", content: "Button"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input"}
			]}
		]},
		{kind: "HFlexBox", flex: 1, components: [
			{flex: 1},
			{kind: "VFlexBox", flex: 2, classes: "fittable-sample-shadow", components: [
				{classes: "fittable-sample-shadow2", style: "position:relative; z-index:1", flex: 1},
				{flex: 2, classes: "fittable-sample-fitting-color"}
			]}
		]}
	]
});
