let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  Events = Matter.Events,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Body = Matter.Body,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies;

let engine = Engine.create(),
  world = engine.world;

let render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 1200,
    height: 700,
    showAngleIndicator: true,
    wireframes: false,
  },
});

let collisionGroup = Body.nextGroup(true);  

let rockOptions = {
  restitution: 0.3,
  collisionFilter: {
    group: collisionGroup
  },
  render: {
    sprite: { texture: "./checkmark2.png", xScale: 0.05, yScale: 0.05 },
  },
};

let rock = Bodies.polygon(170, 450, 8, 20, rockOptions);
let anchor = { x: 170, y: 450 };

let elastic = Constraint.create({
  pointA: anchor,
  bodyB: rock,
  length: 0.01,
  damping: 0.01,
  stiffness: 0.05,
});

let rimLeft = Bodies.rectangle(670, 200, 20, 10, {
  isStatic: true,
  render: { fillStyle: "#FF0000" },
});
let rimRight = Bodies.rectangle(800, 200, 20, 10, {
  isStatic: true,
  render: { fillStyle: "#FF0000" },
});


let net = createCloth(670, 210, 8, 4, 10, 10, true, 4);

for (let i = 0; i < 8; i++) {
  net.bodies[i].isStatic = true;
}

let obstacle = Bodies.rectangle(610, 250, 20, 200, {
  isStatic: true,
  render: { fillStyle: "#f3f3f3" },
});

Composite.add(engine.world, [
  obstacle,
  rock,
  elastic,
  rimLeft,
  rimRight,
  net,
]);

Events.on(engine, "afterUpdate", function () {
  if (
    mouseConstraint.mouse.button === -1 &&
    (rock.position.x > 190 || rock.position.y < 430)
  ) {
    if (Body.getSpeed(rock) > 45) {
      Body.setSpeed(rock, 45);
    }

    rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
    Composite.add(engine.world, rock);
    elastic.bodyB = rock;
  }
});

let mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });

Composite.add(world, mouseConstraint);

render.mouse = mouse;

Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 },
});

Render.run(render);
let runner = Runner.create();
Runner.run(runner, engine);

function createCloth(
  xx,
  yy,
  columns,
  rows,
  columnGap,
  rowGap,
  crossBrace,
  particleRadius
) {
  let group = collisionGroup;
  let particleOptions = {
    inertia: Infinity,
    friction: 0.00001,
    collisionFilter: { group: group },
    render: { fillStyle: "#FFFFFF" },
  };
  let constraintOptions = {
    stiffness: 0.1,
    render: { type: "line", anchors: false },
  };

  let cloth = Composites.stack(
    xx,
    yy,
    columns,
    rows,
    columnGap,
    rowGap,
    function (x, y) {
      return Bodies.circle(x, y, particleRadius, particleOptions);
    }
  );

  Composites.mesh(cloth, columns, rows, crossBrace, constraintOptions);
  cloth.label = "Cloth Body";
  return cloth;
}
