export class Dashboard {
  #search = $state("");
  #operation = $state("all");
  #minDuration = $state(0);
  #maxDuration = $state(0);
  #currentPage = $state(1);

  get search() {
    return this.#search;
  }

  set search(value: string) {
    this.#search = value;
    this.#currentPage = 1;
  }

  get operation() {
    return this.#operation;
  }

  set operation(value: string) {
    this.#operation = value;
    this.#currentPage = 1;
  }

  get minDuration() {
    return this.#minDuration;
  }

  set minDuration(value: number) {
    this.#minDuration = value;
    this.#currentPage = 1;
  }

  get maxDuration() {
    return this.#maxDuration;
  }

  set maxDuration(value: number) {
    this.#maxDuration = value;
    this.#currentPage = 1;
  }

  get currentPage() {
    return this.#currentPage;
  }

  set currentPage(value: number) {
    this.#currentPage = value;
  }
}
