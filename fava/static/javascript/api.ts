import { fetchAPI, urlFor } from "./helpers";
import { notify } from "./notifications";
import { fetch, handleJSON } from "./lib/fetch";
import { string, object, unknown } from "./lib/validation";

const validateAPIResponse = object({ data: unknown });
const putAPIValidators = {
  add_document: string,
  add_entries: string,
  format_source: string,
  source: string,
  source_slice: string,
};

type apiTypes = typeof putAPIValidators;

/**
 * PUT to an API endpoint and convert the returned JSON data to an object.
 * @param endpoint - the endpoint to fetch
 * @param body - either a FormData instance or an object that will be converted
 *               to JSON.
 */
export async function put<T extends keyof apiTypes>(
  endpoint: T,
  body: FormData | unknown
): Promise<ReturnType<apiTypes[T]>> {
  const opts =
    body instanceof FormData
      ? { body }
      : {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        };
  const res = await fetch(urlFor(`api/${endpoint}`), {
    method: "PUT",
    ...opts,
  }).then(handleJSON);
  const { data }: { data: unknown } = validateAPIResponse(res);
  return putAPIValidators[endpoint](data) as ReturnType<apiTypes[T]>;
}

/**
 * Move a file, either in an import directory or a document.
 * @returns whether the file was moved successfully.
 */
export async function moveDocument(
  filename: string,
  account: string,
  newName: string
): Promise<boolean> {
  try {
    const msg = await fetchAPI("move", {
      filename,
      account,
      newName,
    });
    notify(string(msg));
    return true;
  } catch (error) {
    notify(error, "error");
    return false;
  }
}
