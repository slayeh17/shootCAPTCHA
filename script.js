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
  restitution: 0.9,
  collisionFilter: {
    group: collisionGroup,
  },
  render: {
    sprite: { texture: "./checkmark2.png", xScale: 0.05, yScale: 0.05 },
  },
};

let topBound = Bodies.rectangle(0, 0, 3000, 20, {
  isStatic: true,
  render: { fillStyle: "#f4f600" },
});

let rock = Bodies.polygon(170, 450, 8, 20, rockOptions);
let anchor = { x: 170, y: 450 };

let elastic = Constraint.create({
  pointA: anchor,
  bodyB: rock,
  length: 0.01,
  damping: 0.01,
  stiffness: 0.05,
});

let rimLeft = Bodies.rectangle(680, 200, 20, 10, {
  isStatic: true,
  render: { fillStyle: "#FF0000" },
});
let rimRight = Bodies.rectangle(790, 200, 20, 10, {
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

let reCaptchaBox = Bodies.rectangle(735, 320, 120, 30, {
  isStatic: true,
  isSensor: true,
  render: {
    sprite: {
      texture: "./recaptcha.png",
      xScale: 0.1,
      yScale: 0.1,
    },
  },
});

Composite.add(engine.world, [
  obstacle,
  rock,
  elastic,
  rimLeft,
  rimRight,
  net,
  topBound,
  reCaptchaBox,
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

Events.on(engine, "collisionStart", function (event) {
  var pairs = event.pairs;

  console.log(pairs);
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    if (pair.bodyA === reCaptchaBox) {
      console.log("collided");
      endGame();
    } else if (pair.bodyB === reCaptchaBox) {
      console.log("collided");
      endGame();
    }
  }
});

function endGame() {
  let reCaptchaBoxChecked = Bodies.rectangle(400, 320, 150, 50, {
    isStatic: true,
    render: {
      sprite: {
        texture: "./checked.png",
        xScale: 0.3,
        yScale: 0.3,
      },
    },
  });

  let ground = Bodies.rectangle(800, 600, 3000, 20, {
    isStatic: true,
    render: { fillStyle: "#FF0000" },
  });
  
  const p = document.getElementById('message');
  p.innerText = "Congratulations, You are a human! Here are some balls to play with. 😀"
  console.log(p);

  let stack = Composites.stack(
    100,
    306 - 25.25 - 5 * 40,
    15,
    10,
    0,
    0,
    function (x, y) {
      return Bodies.circle(x, y, 20, {
        restitution: 0.9
      });
    }
  );

  Composite.remove(engine.world, [
    obstacle,
    rock,
    elastic,
    rimLeft,
    rimRight,
    net,
    topBound,
    reCaptchaBox,
  ]);

  Composite.add(engine.world, [reCaptchaBoxChecked, ground, stack]);
}
