enyo.kind({
	name: "enyo.sample.AppLayout2",
	kind: "HFlexBox",  
	components: [
		{kind: "VFlexBox", flex: 1, components: [
			{flex: 1},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "1"}
			]}
		]},
		{kind: "VFlexBox", flex: 1, classes: "fittable-sample-shadow", components: [
			{flex: 1, style: ""},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]},
		{kind: "VFlexBox", flex: 3, classes: "fittable-sample-shadow", components: [
			{flex: 1, classes: "fittable-sample-fitting-color"},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "3"}
			]}
		]}
	]
});
