<template lang="pug">
    #app
        .container
            main.main
                h1.title {{ friendCount }} случайных друзей
                friend-card(
                    v-if="friends.length"
                    v-for="friend in friends"
                    :key="friend.id"
                    :friend="friend"
                )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FriendCard from '@/components/FriendCard.vue';
import { Friend, VkFriendResponse } from '@/types';
// @ts-ignore
import postscribe from 'postscribe';


@Component({
  components: {
    FriendCard
  },
})
export default class App extends Vue {
    private friends: Friend[] = [];

    private friendCount = 5;

    private apiVersion = '5.103';
    private clientId = '6713277';

    private accessToken!: string;
    private requestCallbackFunctionName = 'VK_API_REQUEST_CALLBACK_FUNCTION';

    private authUrl = 'https://oauth.vk.com/authorize'
                      + '?client_id=' + this.clientId
                      + '&redirect_uri=' + process.env.VUE_APP_SITE_ADDRESS
                      + '&scope=friends'
                      + '&response_type=token'

    get friendsRequestUrl (): string {
        return 'https://api.vk.com/method/friends.get'
               + '?v=' + this.apiVersion
               + '&access_token=' + this.accessToken
               + '&order=random'
               + '&count=' + this.friendCount
               + '&fields=photo_100,city'
               + '&callback=' + this.requestCallbackFunctionName;
    }

    calculateExpireDate (timeDelta: string | number) {
        return Date.now() + +timeDelta * 1000;
    }

    checkHash (): string | null {
        if (!location.hash) {
            return null;
        }

        const urlParams = new URLSearchParams(location.hash.slice(1));

        if (!urlParams.has('access_token')) {
            return null;
        }

        const accessToken = urlParams.get('access_token')!;

        this.$cookies.set(
            'accessToken',
            accessToken,
            this.calculateExpireDate(urlParams.get('expires_in')!)
        )

        history.pushState('', document.title, location.pathname + location.search);

        return accessToken;
    }

    requestCallback (data: VkFriendResponse) {
        this.friends = data.response.items;
    }

    created () {
        let accessToken;

        if (!this.$cookies.isKey('accessToken')) {
            accessToken = this.checkHash();

            if (accessToken === null) {
                location.assign(this.authUrl);
            }
        } else {
            accessToken = this.$cookies.get('accessToken');
        }

        this.accessToken = accessToken;

        // @ts-ignore
        window[this.requestCallbackFunctionName] = this.requestCallback;
        postscribe('#app', `<script type="text/javascript" src="${this.friendsRequestUrl}"><\/script>`);
    }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');

html {
    background-color: #eee;
}

body {
    margin: 0;
    min-height: 100vh;
}

#app {
    font-family: 'Open Sans', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #222;

    .container {
        margin: auto;
        max-width: 720px;
        height: 100%;
    }

    .main {
        width: 100%;

        .title {
            text-align: center;
            font-size: 3em;
        }
    }
}
</style>
