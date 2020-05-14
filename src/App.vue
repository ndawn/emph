<template lang="pug">
    #app
        .container
            main.main
                h1.title {{ friendCount }} случайных друзей
                button.auth-button(type="button" v-if="accessToken === null" @click="authRequest") Авторизоваться
                friend-card(
                    v-if="friends.length"
                    v-for="friend in friends"
                    :key="friend.id"
                    :friend="friend"
                )
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
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

    private accessToken: string | null = null;
    private requestCallbackFunctionName = 'VK_API_REQUEST_CALLBACK_FUNCTION';

    private authUrl = 'https://oauth.vk.com/authorize'
                      + '?client_id=' + this.clientId
                      + '&redirect_uri=' + process.env.VUE_APP_SITE_ADDRESS
                      + '&scope=friends'
                      + '&response_type=token'

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

    authRequest () {
        location.assign(this.authUrl);
    }

    friendRequest () {
        // @ts-ignore
        window[this.requestCallbackFunctionName] = this.requestCallback;
        postscribe('#app', `<script type="text/javascript" src="${this.friendsRequestUrl}"><\/script>`);
    }

    requestCallback (data: VkFriendResponse) {
        this.friends = data.response.items;
    }

    get friendsRequestUrl (): string {
        return 'https://api.vk.com/method/friends.get'
            + '?v=' + this.apiVersion
            + '&access_token=' + this.accessToken
            + '&order=random'
            + '&count=' + this.friendCount
            + '&fields=photo_100,city'
            + '&callback=' + this.requestCallbackFunctionName;
    }

    @Watch('accessToken')
    onPropertyChanged (value: string | null) {
        if (value) {
            this.friendRequest();
        }
    }

    created () {
        let accessToken;

        if (!this.$cookies.isKey('accessToken')) {
            accessToken = this.checkHash();

            if (accessToken === null) {
                return
            }
        } else {
            accessToken = this.$cookies.get('accessToken');
        }

        this.accessToken = accessToken;
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

        .auth-button {
            display: block;
            margin: auto;
            padding: 16px 36px;
            font-size: 1.4em;
            outline: none;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(30, 144, 255, 0.6);
            color: white;
            background: dodgerblue;
            transition: box-shadow 0.2s ease;
            cursor: pointer;

            &:hover {
                box-shadow: 0 4px 8px 4px rgba(30, 144, 255, 0.4);
            }
        }
    }
}
</style>
