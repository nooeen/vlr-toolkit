import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as compression from "compression";
import { ValidationPipe } from "@nestjs/common";
import * as nocache from "nocache";

function headersSent(res) {
  return typeof res.headersSent !== "boolean"
    ? Boolean(res._header)
    : res.headersSent;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.get("WEB_PORT") ?? 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  // app.useGlobalInterceptors(
  // 	// ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
  // 	// https://github.com/typestack/class-transformer/issues/549
  // 	new ResolvePromisesInterceptor(),
  // 	new ClassSerializerInterceptor(app.get(Reflector))
  // );

  app.enable("trust proxy");

  app.use(cookieParser());
  app.use(compression());

  if (configService.get("NODE_ENV") !== "production") {
    app.use(nocache());
  }

  app.setBaseViewsDir(join(__dirname, "..", "..", "..", "views", "web"));
  app.setViewEngine("ejs");

  app.disable("x-powered-by");
  app.disable("view cache");

  logger.token("full_url", function getHostToken(req) {
    return (
      (req.headers["x-forwarded-proto"] || req.protocol) +
      "://" +
      req.get("host") +
      req.originalUrl
    );
  });
  logger.format("full_dev", function developmentFormatLine(tokens, req, res) {
    // get the status code if response written
    const status = headersSent(res) ? res.statusCode : undefined;

    // get status color
    const color =
      status >= 500
        ? 31 // red
        : status >= 400
        ? 33 // yellow
        : status >= 300
        ? 36 // cyan
        : status >= 200
        ? 32 // green
        : 0; // no color

    // get colored function
    let fn = developmentFormatLine[color];

    if (!fn) {
      // compile
      fn = developmentFormatLine[color] = logger.compile(
        "\x1b[" +
          color +
          "m:date \x1b[0m:method :full_url \x1b[" +
          color +
          "m:status \x1b[0m:response-time ms - :res[content-length]\x1b[0m"
      );
    }

    return fn(tokens, req, res);
  });
  app.use(logger("full_dev"));

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  await app.listen(port);

  console.log(`---------- WEB_PORT: ${port} ----------`);
}

bootstrap();
