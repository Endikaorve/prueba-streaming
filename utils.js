export function html(strings, ...values) {
  return {
    strings,
    values,
    type: "template",
  };
}

export async function* render(template) {
  if (!template) return;

  if (template.type === "template") {
    const { strings, values } = template;
    for (let i = 0; i < strings.length; i++) {
      yield strings[i];

      if (i < values.length) {
        const value = values[i];

        if (value === null || value === undefined) {
        } else if (typeof value === "string") {
          yield value;
        } else if (value instanceof Promise) {
          yield* render(await value);
        } else if (Symbol.asyncIterator in Object(value)) {
          yield* value;
        } else if (Array.isArray(value)) {
          for (const item of value) {
            yield* render(item);
          }
        } else if (typeof value === "object" && value.type === "template") {
          yield* render(value);
        } else {
          yield String(value);
        }
      }
    }
    return;
  }

  if (template === null || template === undefined) {
  } else if (typeof template === "string") {
    yield template;
  } else if (template instanceof Promise) {
    yield* render(await template);
  } else if (Symbol.asyncIterator in Object(template)) {
    yield* template;
  } else if (Array.isArray(template)) {
    for (const item of template) {
      yield* render(item);
    }
  } else {
    yield String(template);
  }
}

const encoder = new TextEncoder();

export function createReadableStream(output) {
  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await output.next();

        if (done) {
          controller.close();
          break;
        }

        controller.enqueue(encoder.encode(value));
      }
    },
  });
}

export const delayed = (ms, data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, ms);
  });
